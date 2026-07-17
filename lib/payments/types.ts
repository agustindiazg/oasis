export type PaymentProviderName = "MERCADO_PAGO" | "STRIPE" | "GALIO";

export type ProviderPayment = {
  id: string;
  externalReference: string | null;
  collectorId?: string | null;
  status: string;
  amount: number;
  currency: string;
  paidAt: Date | null;
  raw: unknown;
};

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  createPaymentLink(input: { externalReference: string; title: string; amount: number; currency: string; payerEmail?: string | null; notificationUrl: string }): Promise<{ id: string; url: string }>;
  getPayment(paymentId: string): Promise<ProviderPayment>;
}
