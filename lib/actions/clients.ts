"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { startOfDay } from "date-fns";
import { and, eq, gte, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { auditLogs, billingPeriods, billingPlans, clients, servicePlans } from "@/lib/db/schema";
import { assertWorkspaceAdmin, getCurrentContext } from "@/lib/current-context";
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
  currency: z.literal("ARS"),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"]),
  dueDay: z.coerce.number().int().min(0).max(31),
  intervalDays: z.coerce.number().int().min(1).max(365).optional(),
  firstCharge: z.enum(["NEXT", "TODAY", "CUSTOM"]),
  firstChargeDate: z.string().optional(),
  servicePlanId: z.string().uuid().or(z.literal("")),
  saveAsServicePlan: z.enum(["on"]).optional(),
});

export async function createClient(formData: FormData) {
  const context = await getCurrentContext();
  assertWorkspaceAdmin(context);
  const values = schema.parse(Object.fromEntries(formData));
  const clientId = crypto.randomUUID();
  const planId = crypto.randomUUID();
  const [catalogPlan] = values.servicePlanId ? await db.select().from(servicePlans).where(and(eq(servicePlans.id, values.servicePlanId), eq(servicePlans.organizationId, context.organizationId), eq(servicePlans.status, "ACTIVE"))).limit(1) : [];
  if (values.servicePlanId && !catalogPlan) throw new Error("Plan no encontrado.");
  const amount = catalogPlan?.amount ?? parseMoney(values.amount);
  const frequency = catalogPlan?.frequency ?? values.frequency;
  const dueDay = catalogPlan?.dueDay ?? values.dueDay;
  const serviceName = catalogPlan?.name ?? values.serviceName;
  const baseDueDate = values.firstCharge === "TODAY"
    ? new Date()
    : values.firstCharge === "CUSTOM" && values.firstChargeDate
      ? new Date(`${values.firstChargeDate}T12:00:00`)
      : computeInitialDueDate(frequency, dueDay, values.intervalDays ?? null);

  await db.transaction(async (tx) => {
    let reusablePlanId = catalogPlan?.id ?? null;
    if (!reusablePlanId && values.saveAsServicePlan === "on") {
      reusablePlanId = crypto.randomUUID();
      await tx.insert(servicePlans).values({
        id: reusablePlanId,
        organizationId: context.organizationId,
        name: serviceName,
        description: null,
        amount,
        currency: values.currency,
        frequency,
        dueDay: frequency === "MONTHLY" || frequency === "WEEKLY" ? dueDay : null,
      });
    }
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
      servicePlanId: reusablePlanId,
      serviceName,
      amount,
      currency: values.currency,
      frequency,
      intervalDays: null,
      dueDay: frequency === "MONTHLY" || frequency === "WEEKLY" ? dueDay : null,
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
  assertWorkspaceAdmin(context);
  const values = inlineDetailsSchema.parse(Object.fromEntries(formData));
  await db.transaction(async (tx) => {
    await tx.update(clients).set({ notes: values.notes || null, startedAt: new Date(`${values.startedAt}T12:00:00`) }).where(and(eq(clients.id, values.clientId), eq(clients.organizationId, context.organizationId)));
    await tx.insert(auditLogs).values({ id: crypto.randomUUID(), organizationId: context.organizationId, userId: context.userId, action: "client.details_updated", entityType: "client", entityId: values.clientId });
  });
  revalidatePath(`/admin/clientes/${values.clientId}`);
}

export async function updateClientPlan(formData: FormData) {
  const context = await getCurrentContext();
  assertWorkspaceAdmin(context);
  const values = updateSchema.parse(Object.fromEntries(formData));
  const [plan] = await db.select().from(billingPlans).where(and(eq(billingPlans.id, values.planId), eq(billingPlans.clientId, values.clientId), eq(billingPlans.organizationId, context.organizationId))).limit(1);
  if (!plan) throw new Error("Plan no encontrado.");
  const amount = parseMoney(values.amount);
    const intervalDays = null;
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

const assignPlanSchema = z.object({
  clientId: z.string().uuid().or(z.string().startsWith("client-")),
  billingPlanId: z.string().uuid().or(z.string().startsWith("plan-")),
  servicePlanId: z.string().uuid().or(z.literal("")),
  serviceName: z.string().trim().min(2),
  amount: z.string().min(1),
  currency: z.literal("ARS"),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"]),
  dueDay: z.coerce.number().int().min(0).max(31),
  saveAsServicePlan: z.enum(["on"]).optional(),
});

export async function assignClientPlan(formData: FormData) {
  const context = await getCurrentContext();
  assertWorkspaceAdmin(context);
  const values = assignPlanSchema.parse(Object.fromEntries(formData));
  const [[billingPlan], [catalogPlan]] = await Promise.all([
    db.select().from(billingPlans).where(and(eq(billingPlans.id, values.billingPlanId), eq(billingPlans.clientId, values.clientId), eq(billingPlans.organizationId, context.organizationId))).limit(1),
    ...(values.servicePlanId ? [db.select().from(servicePlans).where(and(eq(servicePlans.id, values.servicePlanId), eq(servicePlans.organizationId, context.organizationId), eq(servicePlans.status, "ACTIVE"))).limit(1)] : [Promise.resolve([])]),
  ]);
  if (!billingPlan || (values.servicePlanId && !catalogPlan)) throw new Error("No se encontró el plan seleccionado.");
  const amount = catalogPlan?.amount ?? parseMoney(values.amount);
  const frequency = catalogPlan?.frequency ?? values.frequency;
  const dueDay = catalogPlan?.frequency === "MONTHLY" || catalogPlan?.frequency === "WEEKLY" ? catalogPlan.dueDay : catalogPlan ? null : values.dueDay;
  const serviceName = catalogPlan?.name ?? values.serviceName;
  const intervalDays = catalogPlan?.intervalDays ?? null;
  const scheduleChanged = billingPlan.frequency !== frequency || billingPlan.dueDay !== dueDay || billingPlan.intervalDays !== intervalDays;
  const nextPeriodAt = scheduleChanged ? computeInitialDueDate(frequency, dueDay, intervalDays) : billingPlan.nextPeriodAt;
  await db.transaction(async (tx) => {
    let reusablePlanId = catalogPlan?.id ?? null;
    if (!reusablePlanId && values.saveAsServicePlan === "on") {
      reusablePlanId = crypto.randomUUID();
      await tx.insert(servicePlans).values({ id: reusablePlanId, organizationId: context.organizationId, name: serviceName, description: null, amount, currency: values.currency, frequency, intervalDays, dueDay });
    }
    await tx.update(billingPlans).set({ servicePlanId: reusablePlanId, serviceName, amount, currency: values.currency, frequency, intervalDays, dueDay, nextPeriodAt }).where(eq(billingPlans.id, billingPlan.id));
    if (scheduleChanged) {
      await tx.delete(billingPeriods).where(and(eq(billingPeriods.planId, billingPlan.id), gte(billingPeriods.dueAt, startOfDay(new Date())), inArray(billingPeriods.status, ["PENDING", "IN_PROCESS", "REJECTED"])));
    } else {
      await tx.update(billingPeriods).set({ amount, currency: values.currency, paymentLink: null }).where(and(eq(billingPeriods.planId, billingPlan.id), gte(billingPeriods.dueAt, startOfDay(new Date())), inArray(billingPeriods.status, ["PENDING", "IN_PROCESS", "REJECTED"])));
    }
    await tx.insert(auditLogs).values({ id: crypto.randomUUID(), organizationId: context.organizationId, userId: context.userId, action: "client.plan_assigned", entityType: "billing_plan", entityId: billingPlan.id, metadata: { servicePlanId: reusablePlanId } });
  });
  if (billingPlan.status === "ACTIVE") await generatePeriodsForPlan(billingPlan.id);
  await syncPaymentLinks(context.organizationId).catch((error) => console.error("No se pudieron regenerar links; el cron reintentará.", error));
  revalidatePath(`/admin/clientes/${values.clientId}`); revalidatePath(`/admin/clientes/${values.clientId}/cambiar-plan`); revalidatePath("/admin/clientes"); revalidatePath("/admin/cobros");
  redirect(`/admin/clientes/${values.clientId}`);
}
