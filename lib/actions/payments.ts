"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { assertWorkspaceAdmin, getCurrentContext } from "@/lib/current-context";
import { db } from "@/lib/db";
import { auditLogs, billingPeriods } from "@/lib/db/schema";
import { syncPaymentLinks } from "@/lib/payments/service";

const periodIdSchema = z.string().uuid().or(z.string().startsWith("period-"));

export async function generatePaymentLink(formData: FormData) {
  const contextPromise = getCurrentContext();
  const periodId = periodIdSchema.parse(formData.get("periodId"));
  const context = await contextPromise;
  assertWorkspaceAdmin(context);
  const [period] = await db.select({ id: billingPeriods.id, clientId: billingPeriods.clientId })
    .from(billingPeriods)
    .where(and(
      eq(billingPeriods.id, periodId),
      eq(billingPeriods.organizationId, context.organizationId),
      inArray(billingPeriods.status, ["PENDING", "IN_PROCESS", "OVERDUE", "REJECTED"]),
    ))
    .limit(1);

  if (!period) redirect(`/admin/cobros/${periodId}?link=unavailable`);

  let result = "created";
  try {
    await syncPaymentLinks(context.organizationId);
    const [updated] = await db.select({ paymentLink: billingPeriods.paymentLink })
      .from(billingPeriods)
      .where(and(eq(billingPeriods.id, period.id), eq(billingPeriods.organizationId, context.organizationId)))
      .limit(1);
    if (!updated?.paymentLink) throw new Error("Mercado Pago no devolvió un link de pago.");
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      organizationId: context.organizationId,
      userId: context.userId,
      action: "payment_link.created",
      entityType: "billing_period",
      entityId: period.id,
    });
  } catch (error) {
    result = "error";
    console.error("No se pudo generar el link de Mercado Pago.", error);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/cobros");
  revalidatePath(`/admin/cobros/${period.id}`);
  revalidatePath(`/admin/clientes/${period.clientId}`);
  redirect(`/admin/cobros/${period.id}?link=${result}`);
}
