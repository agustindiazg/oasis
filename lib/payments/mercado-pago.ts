import type { PaymentProvider, ProviderPayment } from "@/lib/payments/types";

const API = "https://api.mercadopago.com";

type TokenResponse = { access_token: string; refresh_token?: string; expires_in: number; user_id: number };

export class MercadoPagoProvider implements PaymentProvider {
  readonly name = "MERCADO_PAGO" as const;
  constructor(private accessToken: string) {}

  async createPaymentLink(input: { externalReference: string; title: string; amount: number; currency: string; payerEmail?: string | null; notificationUrl: string }) {
    const response = await this.request<{ id: string; init_point: string }>("/checkout/preferences", {
      method: "POST",
      body: JSON.stringify({
        items: [{ id: input.externalReference, title: input.title, quantity: 1, currency_id: input.currency, unit_price: input.amount / 100 }],
        external_reference: input.externalReference,
        payer: input.payerEmail ? { email: input.payerEmail } : undefined,
        notification_url: input.notificationUrl,
        auto_return: "approved",
        back_urls: {
          success: `${process.env.BETTER_AUTH_URL}/pago/resultado?status=success`,
          pending: `${process.env.BETTER_AUTH_URL}/pago/resultado?status=pending`,
          failure: `${process.env.BETTER_AUTH_URL}/pago/resultado?status=failure`,
        },
      }),
    });
    return { id: response.id, url: response.init_point };
  }

  async getPayment(paymentId: string): Promise<ProviderPayment> {
    const payment = await this.request<{ id: number; external_reference: string | null; status: string; transaction_amount: number; currency_id: string; date_approved: string | null }>(`/v1/payments/${paymentId}`);
    return { id: String(payment.id), externalReference: payment.external_reference, status: payment.status, amount: Math.round(payment.transaction_amount * 100), currency: payment.currency_id, paidAt: payment.date_approved ? new Date(payment.date_approved) : null, raw: payment };
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API}${path}`, { ...init, headers: { Authorization: `Bearer ${this.accessToken}`, "Content-Type": "application/json", ...init?.headers }, cache: "no-store" });
    if (!response.ok) throw new Error(`Mercado Pago respondió ${response.status}: ${await response.text()}`);
    return response.json() as Promise<T>;
  }
}

export async function exchangeAuthorizationCode(code: string) {
  return oauthToken({ grant_type: "authorization_code", code, redirect_uri: process.env.MERCADO_PAGO_REDIRECT_URI });
}

export async function refreshAccessToken(refreshToken: string) {
  return oauthToken({ grant_type: "refresh_token", refresh_token: refreshToken });
}

async function oauthToken(values: Record<string, unknown>): Promise<TokenResponse> {
  const response = await fetch(`${API}/oauth/token`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ client_id: process.env.MERCADO_PAGO_CLIENT_ID, client_secret: process.env.MERCADO_PAGO_CLIENT_SECRET, ...values }), cache: "no-store" });
  if (!response.ok) throw new Error(`No se pudo autorizar Mercado Pago (${response.status}).`);
  return response.json() as Promise<TokenResponse>;
}
