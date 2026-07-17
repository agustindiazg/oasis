import { addSeconds } from "date-fns";
import { and, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { billingPeriods, billingPlans, clients, paymentConnections, payments } from "@/lib/db/schema";
import { decryptToken, encryptToken } from "@/lib/payments/crypto";
import { MercadoPagoProvider, refreshAccessToken } from "@/lib/payments/mercado-pago";
import type { ProviderPayment } from "@/lib/payments/types";

export async function syncPaymentLinks(organizationId: string) {
  const [connection] = await db.select().from(paymentConnections).where(and(eq(paymentConnections.organizationId, organizationId), eq(paymentConnections.provider, "MERCADO_PAGO"), eq(paymentConnections.status, "CONNECTED"), isNotNull(paymentConnections.encryptedAccessToken))).limit(1);
  if (!connection?.encryptedAccessToken) return { created: 0 };
  const provider = await resolveMercadoPagoProvider(connection);
  const periods = await db.select({ id: billingPeriods.id, amount: billingPeriods.amount, currency: billingPeriods.currency, name: clients.name, email: clients.email, service: billingPlans.serviceName }).from(billingPeriods).innerJoin(clients, eq(clients.id, billingPeriods.clientId)).innerJoin(billingPlans, eq(billingPlans.id, billingPeriods.planId)).where(and(eq(billingPeriods.organizationId, organizationId), inArray(billingPeriods.status, ["PENDING", "OVERDUE", "REJECTED"]), isNull(billingPeriods.paymentLink))).limit(50);
  let created = 0;
  for (const period of periods) {
    const notificationUrl = `${process.env.BETTER_AUTH_URL}/api/payments/mercadopago/webhook?organizationId=${encodeURIComponent(organizationId)}&source_news=webhooks`;
    const link = await provider.createPaymentLink({ externalReference: period.id, title: `${period.service} · ${period.name}`, amount: period.amount, currency: period.currency, payerEmail: period.email, notificationUrl });
    await db.update(billingPeriods).set({ paymentLink: link.url }).where(and(eq(billingPeriods.id, period.id), isNull(billingPeriods.paymentLink)));
    created += 1;
  }
  return { created };
}

export async function applyProviderPayment(organizationId: string, providerPayment: ProviderPayment) {
  if (!providerPayment.externalReference) throw new Error("El pago no tiene external_reference.");
  const [period] = await db.select().from(billingPeriods).where(and(eq(billingPeriods.id, providerPayment.externalReference), eq(billingPeriods.organizationId, organizationId))).limit(1);
  if (!period) throw new Error("El cobro asociado no existe.");
  const status = mapStatus(providerPayment.status);
  await db.transaction(async (tx) => {
    await tx.insert(payments).values({ id: crypto.randomUUID(), organizationId, billingPeriodId: period.id, provider: "MERCADO_PAGO", providerPaymentId: providerPayment.id, externalReference: period.id, amount: providerPayment.amount, currency: providerPayment.currency, status: providerPayment.status, paidAt: providerPayment.paidAt, rawPayload: providerPayment.raw }).onDuplicateKeyUpdate({ set: { status: providerPayment.status, paidAt: providerPayment.paidAt, rawPayload: providerPayment.raw } });
    await tx.update(billingPeriods).set({ status, paidAt: status === "APPROVED" ? providerPayment.paidAt ?? new Date() : null }).where(eq(billingPeriods.id, period.id));
  });
}

export function tokenExpiry(expiresIn: number) { return addSeconds(new Date(), Math.max(expiresIn - 300, 0)); }

export async function resolveMercadoPagoProvider(connection: typeof paymentConnections.$inferSelect) {
  if (!connection.encryptedAccessToken) throw new Error("La conexión no tiene access token.");
  if (connection.tokenExpiresAt && connection.tokenExpiresAt <= new Date() && connection.encryptedRefreshToken) {
    const token = await refreshAccessToken(decryptToken(connection.encryptedRefreshToken));
    const accessToken = encryptToken(token.access_token);
    await db.update(paymentConnections).set({ encryptedAccessToken: accessToken, encryptedRefreshToken: token.refresh_token ? encryptToken(token.refresh_token) : connection.encryptedRefreshToken, tokenExpiresAt: tokenExpiry(token.expires_in), status: "CONNECTED" }).where(eq(paymentConnections.id, connection.id));
    return new MercadoPagoProvider(token.access_token);
  }
  return new MercadoPagoProvider(decryptToken(connection.encryptedAccessToken));
}

function mapStatus(status: string): typeof billingPeriods.$inferInsert.status {
  if (status === "approved") return "APPROVED";
  if (status === "in_process" || status === "in_mediation" || status === "authorized") return "IN_PROCESS";
  if (status === "rejected") return "REJECTED";
  if (status === "refunded") return "REFUNDED";
  if (status === "charged_back") return "CHARGED_BACK";
  if (status === "cancelled") return "CANCELED";
  return "PENDING";
}
