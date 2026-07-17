import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { paymentConnections } from "@/lib/db/schema";
import { getCurrentContext } from "@/lib/current-context";
import { encryptToken } from "@/lib/payments/crypto";
import { syncPaymentLinks } from "@/lib/payments/service";

function preferences(request: Request, status: string) {
  return NextResponse.redirect(new URL(`/admin/preferencias?mp=${status}`, request.url), 303);
}

export async function POST(request: Request) {
  const accessToken = process.env.MERCADO_PAGO_SANDBOX_ACCESS_TOKEN;
  const providerAccountId = process.env.MERCADO_PAGO_SANDBOX_USER_ID;
  const sandboxEnabled = process.env.MERCADO_PAGO_SANDBOX_ENABLED === "true";

  if (process.env.NODE_ENV === "production" || !sandboxEnabled) {
    return NextResponse.json({ error: "El sandbox de Mercado Pago no está habilitado." }, { status: 404 });
  }
  if (!accessToken || !providerAccountId) return preferences(request, "sandbox-missing");

  const context = await getCurrentContext();
  await db.insert(paymentConnections).values({
    id: crypto.randomUUID(),
    organizationId: context.organizationId,
    provider: "MERCADO_PAGO",
    environment: "SANDBOX",
    providerAccountId,
    encryptedAccessToken: encryptToken(accessToken),
    encryptedRefreshToken: null,
    tokenExpiresAt: null,
    status: "CONNECTED",
  }).onDuplicateKeyUpdate({ set: {
    environment: "SANDBOX",
    providerAccountId,
    encryptedAccessToken: encryptToken(accessToken),
    encryptedRefreshToken: null,
    tokenExpiresAt: null,
    status: "CONNECTED",
  } });

  try {
    await syncPaymentLinks(context.organizationId);
    return preferences(request, "sandbox-connected");
  } catch (error) {
    console.error("Mercado Pago sandbox quedó conectado, pero falló la sincronización inicial.", error);
    return preferences(request, "sandbox-connected-sync-error");
  }
}
