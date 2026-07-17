"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { startOfDay } from "date-fns";
import { and, eq, gte, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { auditLogs, billingPeriods, billingPlans, servicePlans } from "@/lib/db/schema";
import { assertWorkspaceAdmin, getCurrentContext } from "@/lib/current-context";
import { generatePeriodsForPlan } from "@/lib/billing/generate";
import { computeInitialDueDate } from "@/lib/billing/schedule";
import { parseMoney } from "@/lib/money";
import { syncPaymentLinks } from "@/lib/payments/service";

const schema = z.object({
  name: z.string().trim().min(2).max(255),
  description: z.string().trim().max(2000),
  amount: z.string().min(1),
  currency: z.literal("ARS"),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"]),
  dueDay: z.coerce.number().int().min(0).max(31),
});

export async function createServicePlan(formData: FormData) {
  const context = await getCurrentContext();
  assertWorkspaceAdmin(context);
  const values = schema.parse(Object.fromEntries(formData));
  await db.insert(servicePlans).values({
    id: crypto.randomUUID(), organizationId: context.organizationId, name: values.name,
    description: values.description || null, amount: parseMoney(values.amount), currency: values.currency,
    frequency: values.frequency, dueDay: values.frequency === "MONTHLY" || values.frequency === "WEEKLY" ? values.dueDay : null,
  });
  revalidatePath("/admin/planes");
  redirect("/admin/planes");
}

export async function updateServicePlan(formData: FormData) {
  const context = await getCurrentContext();
  assertWorkspaceAdmin(context);
  const id = String(formData.get("id") ?? "");
  const values = schema.parse(Object.fromEntries(formData));
  const [catalogPlan] = await db.select().from(servicePlans).where(and(eq(servicePlans.id, id), eq(servicePlans.organizationId, context.organizationId))).limit(1);
  if (!catalogPlan) throw new Error("Plan no encontrado.");
  const amount = parseMoney(values.amount);
  const dueDay = values.frequency === "MONTHLY" || values.frequency === "WEEKLY" ? values.dueDay : null;
  const scheduleChanged = catalogPlan.frequency !== values.frequency || catalogPlan.dueDay !== dueDay;
  const assignments = await db.select({ id: billingPlans.id }).from(billingPlans).where(and(eq(billingPlans.servicePlanId, id), eq(billingPlans.organizationId, context.organizationId), eq(billingPlans.status, "ACTIVE")));
  await db.transaction(async (tx) => {
    await tx.update(servicePlans).set({ name: values.name, description: values.description || null, amount, currency: values.currency, frequency: values.frequency, dueDay }).where(eq(servicePlans.id, id));
    for (const assignment of assignments) {
      await tx.update(billingPlans).set({ serviceName: values.name, amount, currency: values.currency, frequency: values.frequency, dueDay, nextPeriodAt: scheduleChanged ? computeInitialDueDate(values.frequency, dueDay, null) : undefined }).where(eq(billingPlans.id, assignment.id));
      if (scheduleChanged) {
        await tx.delete(billingPeriods).where(and(eq(billingPeriods.planId, assignment.id), gte(billingPeriods.dueAt, startOfDay(new Date())), inArray(billingPeriods.status, ["PENDING", "IN_PROCESS", "REJECTED"])));
      } else {
        await tx.update(billingPeriods).set({ amount, currency: values.currency, paymentLink: null }).where(and(eq(billingPeriods.planId, assignment.id), gte(billingPeriods.dueAt, startOfDay(new Date())), inArray(billingPeriods.status, ["PENDING", "IN_PROCESS", "REJECTED"])));
      }
    }
    await tx.insert(auditLogs).values({ id: crypto.randomUUID(), organizationId: context.organizationId, userId: context.userId, action: "service_plan.updated", entityType: "service_plan", entityId: id, metadata: { assignments: assignments.length } });
  });
  for (const assignment of assignments) await generatePeriodsForPlan(assignment.id);
  await syncPaymentLinks(context.organizationId).catch((error) => console.error("No se pudieron regenerar links; el cron reintentará.", error));
  revalidatePath("/admin/planes"); revalidatePath("/admin/clientes"); revalidatePath("/admin"); revalidatePath("/admin/cobros");
  redirect("/admin/planes");
}

export async function archiveServicePlan(formData: FormData) {
  const context = await getCurrentContext();
  assertWorkspaceAdmin(context);
  const id = String(formData.get("id") ?? "");
  await db.update(servicePlans).set({ status: "ARCHIVED" }).where(and(eq(servicePlans.id, id), eq(servicePlans.organizationId, context.organizationId)));
  revalidatePath("/admin/planes");
}
