import { addDays, addMonths, differenceInCalendarDays, endOfMonth, format, isSameMonth, startOfDay, startOfMonth } from "date-fns";
import { and, eq, gte, inArray, lt, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { billingPeriods, billingPlans, clients } from "@/lib/db/schema";
import { advanceDueDate } from "@/lib/billing/schedule";

export async function generatePeriodsForPlan(planId: string, horizon = addDays(new Date(), 35)) {
  const [plan] = await db.select({ plan: billingPlans, startedAt: clients.startedAt })
    .from(billingPlans)
    .innerJoin(clients, eq(clients.id, billingPlans.clientId))
    .where(eq(billingPlans.id, planId))
    .limit(1);
  if (!plan || plan.plan.status !== "ACTIVE") return 0;

  let dueAt = plan.plan.nextPeriodAt;
  let created = 0;
  const today = startOfDay(new Date());

  if (plan.plan.frequency === "MONTHLY") {
    await db.delete(billingPeriods).where(and(
      eq(billingPeriods.planId, plan.plan.id),
      gte(billingPeriods.dueAt, startOfMonth(addMonths(today, 1))),
      inArray(billingPeriods.status, ["PENDING", "REJECTED"]),
    ));
  }

  while (lteDate(dueAt, horizon) && shouldCreatePeriod(dueAt, plan.plan.frequency, today)) {
    const periodKey = format(dueAt, "yyyy-MM-dd");
    const result = await db.insert(billingPeriods).values({
      id: crypto.randomUUID(),
      organizationId: plan.plan.organizationId,
      clientId: plan.plan.clientId,
      planId: plan.plan.id,
      periodKey,
      dueAt,
      amount: amountForPeriod(plan.plan.amount, plan.plan.frequency, plan.startedAt, dueAt),
      currency: plan.plan.currency,
      status: startOfDay(dueAt) < today ? "OVERDUE" : "PENDING",
    }).onDuplicateKeyUpdate({ set: { planId: plan.plan.id } });
    if (result[0].affectedRows === 1) created += 1;
    dueAt = advanceDueDate(dueAt, plan.plan.frequency, plan.plan.dueDay, plan.plan.intervalDays);
  }

  if (dueAt.getTime() !== plan.plan.nextPeriodAt.getTime()) {
    await db.update(billingPlans).set({ nextPeriodAt: dueAt }).where(eq(billingPlans.id, plan.plan.id));
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

/** Monthly periods are opened when their calendar month starts, not when they are due. */
function shouldCreatePeriod(dueAt: Date, frequency: typeof billingPlans.$inferSelect["frequency"], today: Date) {
  return frequency !== "MONTHLY" || startOfMonth(dueAt).getTime() <= startOfMonth(today).getTime();
}

function amountForPeriod(
  monthlyAmount: number,
  frequency: typeof billingPlans.$inferSelect["frequency"],
  startedAt: Date,
  dueAt: Date,
) {
  if (frequency !== "MONTHLY" || !isSameMonth(startedAt, dueAt)) return monthlyAmount;

  const billableDays = differenceInCalendarDays(endOfMonth(startedAt), startedAt) + 1;
  const daysInMonth = endOfMonth(startedAt).getDate();
  return Math.round(monthlyAmount * billableDays / daysInMonth);
}
