import { addDays, format, startOfDay } from "date-fns";
import { and, eq, inArray, lt, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { billingPeriods, billingPlans } from "@/lib/db/schema";
import { advanceDueDate } from "@/lib/billing/schedule";

export async function generatePeriodsForPlan(planId: string, horizon = addDays(new Date(), 35)) {
  const [plan] = await db.select().from(billingPlans).where(eq(billingPlans.id, planId)).limit(1);
  if (!plan || plan.status !== "ACTIVE") return 0;

  let dueAt = plan.nextPeriodAt;
  let created = 0;

  while (lteDate(dueAt, horizon)) {
    const periodKey = format(dueAt, "yyyy-MM-dd");
    const result = await db.insert(billingPeriods).values({
      id: crypto.randomUUID(),
      organizationId: plan.organizationId,
      clientId: plan.clientId,
      planId: plan.id,
      periodKey,
      dueAt,
      amount: plan.amount,
      currency: plan.currency,
      status: startOfDay(dueAt) < startOfDay(new Date()) ? "OVERDUE" : "PENDING",
    }).onDuplicateKeyUpdate({ set: { planId: plan.id } });
    if (result[0].affectedRows === 1) created += 1;
    dueAt = advanceDueDate(dueAt, plan.frequency, plan.dueDay, plan.intervalDays);
  }

  if (dueAt.getTime() !== plan.nextPeriodAt.getTime()) {
    await db.update(billingPlans).set({ nextPeriodAt: dueAt }).where(eq(billingPlans.id, plan.id));
  }
  return created;
}

export async function generateBillingPeriods(organizationId?: string, horizon = addDays(new Date(), 35)) {
  const conditions = organizationId
    ? and(eq(billingPlans.status, "ACTIVE"), eq(billingPlans.organizationId, organizationId), lte(billingPlans.nextPeriodAt, horizon))
    : and(eq(billingPlans.status, "ACTIVE"), lte(billingPlans.nextPeriodAt, horizon));
  const plans = await db.select({ id: billingPlans.id }).from(billingPlans).where(conditions);
  let created = 0;
  for (const plan of plans) created += await generatePeriodsForPlan(plan.id, horizon);

  await db.update(billingPeriods).set({ status: "OVERDUE" }).where(and(
    lt(billingPeriods.dueAt, startOfDay(new Date())),
    inArray(billingPeriods.status, ["PENDING", "REJECTED"]),
    organizationId ? eq(billingPeriods.organizationId, organizationId) : undefined,
  ));
  return { plans: plans.length, created };
}

function lteDate(left: Date, right: Date) {
  return left.getTime() <= right.getTime();
}
