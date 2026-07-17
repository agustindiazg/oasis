import { createHmac, timingSafeEqual } from "node:crypto";

function secret() {
  if (!process.env.OASIS_APP_SECRET) throw new Error("Falta OASIS_APP_SECRET.");
  return process.env.OASIS_APP_SECRET;
}

function signatureFor(organizationId: string) {
  return createHmac("sha256", secret()).update(`mercado-pago-webhook:${organizationId}`).digest("base64url");
}

export function createWebhookUrl(organizationId: string) {
  const url = new URL("/api/payments/mercadopago/webhook", process.env.NEXT_PUBLIC_APP_URL);
  url.searchParams.set("organizationId", organizationId);
  url.searchParams.set("signature", signatureFor(organizationId));
  url.searchParams.set("source_news", "webhooks");
  return url.toString();
}

export function verifyWebhookSignature(organizationId: string, receivedSignature: string) {
  const expected = Buffer.from(signatureFor(organizationId), "utf8");
  const received = Buffer.from(receivedSignature, "utf8");
  return received.length === expected.length && timingSafeEqual(received, expected);
}
