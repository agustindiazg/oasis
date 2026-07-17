import { NextResponse } from "next/server";
import { getCurrentContext } from "@/lib/current-context";
import { createOAuthState } from "@/lib/payments/oauth-state";

export async function GET() {
  const context = await getCurrentContext();
  if (!process.env.MERCADO_PAGO_CLIENT_ID || !process.env.MERCADO_PAGO_REDIRECT_URI) {
    return NextResponse.json({ error: "Faltan MERCADO_PAGO_CLIENT_ID y MERCADO_PAGO_REDIRECT_URI." }, { status: 503 });
  }
  const url = new URL("https://auth.mercadopago.com/authorization");
  url.searchParams.set("client_id", process.env.MERCADO_PAGO_CLIENT_ID);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("platform_id", "mp");
  url.searchParams.set("state", createOAuthState({ organizationId: context.organizationId, userId: context.userId }));
  url.searchParams.set("redirect_uri", process.env.MERCADO_PAGO_REDIRECT_URI);
  return NextResponse.redirect(url);
}
