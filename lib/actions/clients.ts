"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { startOfDay } from "date-fns";
import { and, eq, gte, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { auditLogs, billingPeriods, billingPlans, clients } from "@/lib/db/schema";
import { getCurrentContext } from "@/lib/current-context";
import { computeInitialDueDate } from "@/lib/billing/schedule";
import { generatePeriodsForPlan } from "@/lib/billing/generate";
import { parseMoney } from "@/lib/money";
import { syncPaymentLinks } from "@/lib/payments/service";

const schema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email().or(z.literal("")),
  phone: z.string().trim().max(80),
  notes: z.string().trim().max(2000),
  startedAt: z.iso.date(),
  serviceName: z.string().trim().min(2),
  amount: z.string().min(1),
  currency: z.enum(["ARS", "USD"]),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "CUSTOM"]),
  dueDay: z.coerce.number().int().min(0).max(31),
  intervalDays: z.coerce.number().int().min(1).max(365).optional(),
  firstCharge: z.enum(["NEXT", "TODAY", "CUSTOM"]),
  firstChargeDate: z.string().optional(),
});

export async function createClient(formData: FormData) {
  const context = await getCurrentContext();
  const values = schema.parse(Object.fromEntries(formData));
  const clientId = crypto.randomUUID();
  const planId = crypto.randomUUID();
  const amount = parseMoney(values.amount);
  const baseDueDate = values.firstCharge === "TODAY"
    ? new Date()
    : values.firstCharge === "CUSTOM" && values.firstChargeDate
      ? new Date(`${values.firstChargeDate}T12:00:00`)
      : computeInitialDueDate(values.frequency, values.dueDay, values.intervalDays ?? null);

  await db.transaction(async (tx) => {
    await tx.insert(clients).values({
      id: clientId,
      organizationId: context.organizationId,
      name: values.name,
      email: values.email || null,
      phone: values.phone || null,
      notes: values.notes || null,
      startedAt: new Date(`${values.startedAt}T12:00:00`),
    });
    await tx.insert(billingPlans).values({
      id: planId,
      organizationId: context.organizationId,
      clientId,
      serviceName: values.serviceName,
      amount,
      currency: values.currency,
      frequency: values.frequency,
      intervalDays: values.frequency === "CUSTOM" ? values.intervalDays ?? 30 : null,
      dueDay: values.frequency === "MONTHLY" || values.frequency === "WEEKLY" ? values.dueDay : null,
      nextPeriodAt: baseDueDate,
    });
    await tx.insert(auditLogs).values({ id: crypto.randomUUID(), organizationId: context.organizationId, userId: context.userId, action: "client.created", entityType: "client", entityId: clientId });
  });
  await generatePeriodsForPlan(planId);
  await syncPaymentLinks(context.organizationId).catch((error) => console.error("No se pudo generar el link de pago; el cron reintentará.", error));
  revalidatePath("/admin");
  revalidatePath("/admin/clientes");
  redirect(`/admin/clientes/${clientId}`);
}

const updateSchema = schema.omit({ firstCharge: true, firstChargeDate: true }).extend({ clientId: z.string().uuid().or(z.string().startsWith("client-")), planId: z.string().uuid().or(z.string().startsWith("plan-")) });

const inlineDetailsSchema = z.object({
  clientId: z.string().uuid().or(z.string().startsWith("client-")),
  startedAt: z.iso.date(),
  notes: z.string().trim().max(2000),
});

export async function updateClientDetails(formData: FormData) {
  const context = await getCurrentContext();
  const values = inlineDetailsSchema.parse(Object.fromEntries(formData));
  await db.transaction(async (tx) => {
    await tx.update(clients).set({ notes: values.notes || null, startedAt: new Date(`${values.startedAt}T12:00:00`) }).where(and(eq(clients.id, values.clientId), eq(clients.organizationId, context.organizationId)));
    await tx.insert(auditLogs).values({ id: crypto.randomUUID(), organizationId: context.organizationId, userId: context.userId, action: "client.details_updated", entityType: "client", entityId: values.clientId });
  });
  revalidatePath(`/admin/clientes/${values.clientId}`);
}

export async function updateClientPlan(formData: FormData) {
  const context = await getCurrentContext();
  const values = updateSchema.parse(Object.fromEntries(formData));
  const [plan] = await db.select().from(billingPlans).where(and(eq(billingPlans.id, values.planId), eq(billingPlans.clientId, values.clientId), eq(billingPlans.organizationId, context.organizationId))).limit(1);
  if (!plan) throw new Error("Plan no encontrado.");
  const amount = parseMoney(values.amount);
  const intervalDays = values.frequency === "CUSTOM" ? values.intervalDays ?? 30 : null;
  const dueDay = values.frequency === "MONTHLY" || values.frequency === "WEEKLY" ? values.dueDay : null;
  const scheduleChanged = plan.frequency !== values.frequency || plan.dueDay !== dueDay || plan.intervalDays !== intervalDays;
  const nextPeriodAt = scheduleChanged ? computeInitialDueDate(values.frequency, dueDay, intervalDays) : plan.nextPeriodAt;

  await db.transaction(async (tx) => {
    await tx.update(clients).set({ name: values.name, email: values.email || null, phone: values.phone || null, notes: values.notes || null, startedAt: new Date(`${values.startedAt}T12:00:00`) }).where(and(eq(clients.id, values.clientId), eq(clients.organizationId, context.organizationId)));
    await tx.update(billingPlans).set({ serviceName: values.serviceName, amount, currency: values.currency, frequency: values.frequency, dueDay, intervalDays, nextPeriodAt }).where(eq(billingPlans.id, plan.id));
    if (scheduleChanged) {
      await tx.delete(billingPeriods).where(and(eq(billingPeriods.planId, plan.id), gte(billingPeriods.dueAt, startOfDay(new Date())), inArray(billingPeriods.status, ["PENDING", "IN_PROCESS", "REJECTED"])));
    } else {
      await tx.update(billingPeriods).set({ amount, currency: values.currency, paymentLink: null }).where(and(eq(billingPeriods.planId, plan.id), gte(billingPeriods.dueAt, startOfDay(new Date())), inArray(billingPeriods.status, ["PENDING", "IN_PROCESS", "REJECTED"])));
    }
    await tx.insert(auditLogs).values({ id: crypto.randomUUID(), organizationId: context.organizationId, userId: context.userId, action: "client.plan_updated", entityType: "client", entityId: values.clientId });
  });
  if (plan.status === "ACTIVE") await generatePeriodsForPlan(plan.id);
  await syncPaymentLinks(context.organizationId).catch((error) => console.error("No se pudieron regenerar links; el cron reintentará.", error));
  revalidatePath("/admin"); revalidatePath("/admin/clientes"); revalidatePath(`/admin/clientes/${values.clientId}`); revalidatePath("/admin/cobros");
  redirect(`/admin/clientes/${values.clientId}`);
}
