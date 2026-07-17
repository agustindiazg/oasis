import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { paymentConnections } from "@/lib/db/schema";
import { getCurrentContext } from "@/lib/current-context";
import { encryptToken } from "@/lib/payments/crypto";
import { exchangeAuthorizationCode } from "@/lib/payments/mercado-pago";
import { verifyOAuthState } from "@/lib/payments/oauth-state";
import { syncPaymentLinks, tokenExpiry } from "@/lib/payments/service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const rawState = url.searchParams.get("state");
  if (!code || !rawState) return NextResponse.redirect(new URL("/admin/preferencias?mp=error", request.url));
  try {
    const context = await getCurrentContext();
    const state = verifyOAuthState(rawState);
    if (state.organizationId !== context.organizationId || state.userId !== context.userId) throw new Error("La autorización no corresponde a esta sesión.");
    const token = await exchangeAuthorizationCode(code);
    await db.insert(paymentConnections).values({ id: crypto.randomUUID(), organizationId: context.organizationId, provider: "MERCADO_PAGO", providerAccountId: String(token.user_id), encryptedAccessToken: encryptToken(token.access_token), encryptedRefreshToken: token.refresh_token ? encryptToken(token.refresh_token) : null, tokenExpiresAt: tokenExpiry(token.expires_in), status: "CONNECTED" }).onDuplicateKeyUpdate({ set: { providerAccountId: String(token.user_id), encryptedAccessToken: encryptToken(token.access_token), encryptedRefreshToken: token.refresh_token ? encryptToken(token.refresh_token) : null, tokenExpiresAt: tokenExpiry(token.expires_in), status: "CONNECTED" } });
    await syncPaymentLinks(context.organizationId);
    return NextResponse.redirect(new URL("/admin/preferencias?mp=connected", request.url));
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL("/admin/preferencias?mp=error", request.url));
  }
}
