import { createHmac, timingSafeEqual } from "node:crypto";

type OAuthState = { organizationId: string; userId: string; issuedAt: number };

function secret() {
  if (!process.env.OASIS_APP_SECRET) throw new Error("Falta OASIS_APP_SECRET.");
  return process.env.OASIS_APP_SECRET;
}

export function createOAuthState(value: Omit<OAuthState, "issuedAt">) {
  const payload = Buffer.from(JSON.stringify({ ...value, issuedAt: Date.now() })).toString("base64url");
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyOAuthState(state: string): OAuthState {
  const [payload, signature] = state.split(".");
  const expected = createHmac("sha256", secret()).update(payload).digest();
  const received = Buffer.from(signature ?? "", "base64url");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) throw new Error("Estado OAuth inválido.");
  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as OAuthState;
  if (Date.now() - parsed.issuedAt > 10 * 60 * 1000) throw new Error("La autorización de Mercado Pago expiró.");
  return parsed;
}
