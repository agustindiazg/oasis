"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, billingPeriods, billingPlans } from "@/lib/db/schema";
import { assertWorkspaceAdmin, getCurrentContext } from "@/lib/current-context";
import { computeInitialDueDate } from "@/lib/billing/schedule";
import { generatePeriodsForPlan } from "@/lib/billing/generate";

export async function updatePlanStatus(formData: FormData) {
  const context = await getCurrentContext();
  assertWorkspaceAdmin(context);
  const planId = String(formData.get("planId") ?? "");
  const action = String(formData.get("action") ?? "") as "pause" | "cancel" | "reactivate";
  const [plan] = await db.select().from(billingPlans).where(and(eq(billingPlans.id, planId), eq(billingPlans.organizationId, context.organizationId))).limit(1);
  if (!plan) throw new Error("Plan no encontrado.");

  if (action === "pause" || action === "cancel") {
    const status = action === "pause" ? "PAUSED" : "CANCELED";
    await db.transaction(async (tx) => {
      await tx.update(billingPlans).set({ status, pausedAt: action === "pause" ? new Date() : null, canceledAt: action === "cancel" ? new Date() : null }).where(eq(billingPlans.id, plan.id));
      await tx.update(billingPeriods).set({ status: "CANCELED", canceledAt: new Date() }).where(and(eq(billingPeriods.planId, plan.id), gte(billingPeriods.dueAt, new Date()), inArray(billingPeriods.status, ["PENDING", "IN_PROCESS", "REJECTED"])));
      await tx.insert(auditLogs).values({ id: crypto.randomUUID(), organizationId: context.organizationId, userId: context.userId, action: `plan.${action}d`, entityType: "billing_plan", entityId: plan.id });
    });
  } else if (action === "reactivate") {
    const nextPeriodAt = computeInitialDueDate(plan.frequency, plan.dueDay, plan.intervalDays);
    await db.update(billingPlans).set({ status: "ACTIVE", pausedAt: null, canceledAt: null, nextPeriodAt }).where(eq(billingPlans.id, plan.id));
    await generatePeriodsForPlan(plan.id);
  } else {
    throw new Error("Acción inválida.");
  }
  revalidatePath("/admin");
  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${plan.clientId}`);
  revalidatePath("/admin/cobros");
}
