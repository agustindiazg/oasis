import { differenceInCalendarDays, format } from "date-fns";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { billingPeriods, businessSettings, clients, reminderDeliveries } from "@/lib/db/schema";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/ui";
import { ResendNotificationProvider } from "@/lib/notifications/resend";

export async function deliverDueReminders(organizationId: string) {
  const [settings] = await db.select().from(businessSettings).where(eq(businessSettings.organizationId, organizationId)).limit(1);
  if (!settings) return { scheduled: 0, sent: 0, failed: 0 };
  const periods = await db.select({ id: billingPeriods.id, name: clients.name, email: clients.email, dueAt: billingPeriods.dueAt, amount: billingPeriods.amount, currency: billingPeriods.currency, paymentLink: billingPeriods.paymentLink, status: billingPeriods.status }).from(billingPeriods).innerJoin(clients, eq(clients.id, billingPeriods.clientId)).where(and(eq(billingPeriods.organizationId, organizationId), inArray(billingPeriods.status, ["PENDING", "OVERDUE", "REJECTED"]), isNotNull(clients.email)));
  let scheduled = 0; let sent = 0; let failed = 0;
  for (const period of periods) {
    if (!period.email) continue;
    const days = differenceInCalendarDays(period.dueAt, new Date());
    const kind = days === settings.reminderDaysBefore ? "BEFORE_DUE" : days < 0 && settings.overdueRemindersEnabled ? "OVERDUE" : null;
    if (!kind) continue;
    const deliveryKey = kind === "BEFORE_DUE" ? `${period.id}:before` : `${period.id}:overdue:${format(new Date(), "yyyy-MM-dd")}`;
    const [existing] = await db.select({ id: reminderDeliveries.id, status: reminderDeliveries.status }).from(reminderDeliveries).where(eq(reminderDeliveries.deliveryKey, deliveryKey)).limit(1);
    if (existing?.status === "SENT") continue;
    const id = existing?.id ?? crypto.randomUUID();
    if (!existing) {
      await db.insert(reminderDeliveries).values({ id, organizationId, billingPeriodId: period.id, deliveryKey, kind, recipient: period.email });
      scheduled += 1;
    }
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) continue;
    try {
      const provider = new ResendNotificationProvider();
      const result = await provider.sendEmail({ to: period.email, subject: kind === "BEFORE_DUE" ? `Tu pago vence el ${formatDate(period.dueAt)}` : "Tenés un pago pendiente", html: emailHtml({ name: period.name, amount: formatMoney(period.amount, period.currency), due: formatDate(period.dueAt), paymentLink: period.paymentLink, overdue: kind === "OVERDUE" }) });
      await db.update(reminderDeliveries).set({ status: "SENT", providerMessageId: result.id, sentAt: new Date() }).where(eq(reminderDeliveries.id, id));
      sent += 1;
    } catch (error) {
      await db.update(reminderDeliveries).set({ status: "FAILED", error: error instanceof Error ? error.message : "Error desconocido" }).where(eq(reminderDeliveries.id, id));
      failed += 1;
    }
  }
  return { scheduled, sent, failed };
}

function emailHtml({ name, amount, due, paymentLink, overdue }: { name: string; amount: string; due: string; paymentLink: string | null; overdue: boolean }) {
  const button = paymentLink ? `<p style="margin-top:24px"><a href="${paymentLink}" style="background:#191b1a;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:700">Pagar con Mercado Pago</a></p>` : "";
  return `<div style="font-family:Arial,sans-serif;color:#191b1a;line-height:1.6"><h2>Hola ${escapeHtml(name)}</h2><p>${overdue ? "Te recordamos que tenés un pago vencido." : "Tu próximo pago está por vencer."}</p><p><strong>${amount}</strong> · vencimiento ${due}</p>${button}<p style="color:#777;font-size:12px;margin-top:28px">Enviado automáticamente por Oasis.</p></div>`;
}

function escapeHtml(value: string) { return value.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]!); }
