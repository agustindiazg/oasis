import { createHmac, timingSafeEqual } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { paymentConnections, webhookEvents } from "@/lib/db/schema";
import { applyProviderPayment, resolveMercadoPagoProvider } from "@/lib/payments/service";
import { verifyWebhookSignature } from "@/lib/payments/webhook-signature";

type WebhookBody = { id?: string | number; type?: string; action?: string; data?: { id?: string | number } };

export async function POST(request: Request) {
  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId");
  let body: WebhookBody;
  try {
    body = await request.json() as WebhookBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const dataId = String(url.searchParams.get("data.id") ?? body.data?.id ?? "");
  const eventId = String(body.id ?? `${body.action ?? "payment"}-${dataId}`);
  const webhookSignature = url.searchParams.get("signature");
  if (body.type !== "payment" || !dataId || !organizationId || !webhookSignature) return NextResponse.json({ received: true });
  if (!verifyWebhookSignature(organizationId, webhookSignature)) return NextResponse.json({ error: "Invalid webhook routing signature" }, { status: 401 });
  if (!verifySignature(request, dataId)) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  try {
    const [existingEvent] = await db.select().from(webhookEvents).where(and(eq(webhookEvents.provider, "MERCADO_PAGO"), eq(webhookEvents.providerEventId, eventId))).limit(1);
    if (existingEvent?.status === "PROCESSED") return NextResponse.json({ received: true });
    if (existingEvent) {
      await db.update(webhookEvents).set({ payload: body, status: "RECEIVED", error: null, processedAt: null }).where(and(eq(webhookEvents.provider, "MERCADO_PAGO"), eq(webhookEvents.providerEventId, eventId), eq(webhookEvents.status, "FAILED")));
    } else {
      await db.insert(webhookEvents).values({ id: crypto.randomUUID(), provider: "MERCADO_PAGO", providerEventId: eventId, payload: body });
    }
    const [connection] = await db.select().from(paymentConnections).where(and(eq(paymentConnections.organizationId, organizationId), eq(paymentConnections.provider, "MERCADO_PAGO"), eq(paymentConnections.status, "CONNECTED"))).limit(1);
    if (!connection?.encryptedAccessToken) throw new Error("La cuenta de Mercado Pago no está conectada.");
    const provider = await resolveMercadoPagoProvider(connection);
    await applyProviderPayment(organizationId, await provider.getPayment(dataId));
    await db.update(webhookEvents).set({ status: "PROCESSED", processedAt: new Date(), error: null }).where(and(eq(webhookEvents.provider, "MERCADO_PAGO"), eq(webhookEvents.providerEventId, eventId)));
    return NextResponse.json({ received: true });
  } catch (error) {
    await db.update(webhookEvents).set({ status: "FAILED", error: error instanceof Error ? error.message : "Error desconocido" }).where(and(eq(webhookEvents.provider, "MERCADO_PAGO"), eq(webhookEvents.providerEventId, eventId)));
    console.error(error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

function verifySignature(request: Request, dataId: string) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const signature = request.headers.get("x-signature") ?? "";
  const requestId = request.headers.get("x-request-id") ?? "";
  const parts = Object.fromEntries(signature.split(",").map((part) => part.trim().split("=")));
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest();
  const received = Buffer.from(parts.v1 ?? "", "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}
