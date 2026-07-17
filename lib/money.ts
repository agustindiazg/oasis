export function parseMoney(value: FormDataEntryValue | null) {
  if (!value) return 0;
  const normalized = String(value).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * 100);
}

export function formatMoney(amountInCents: number, currency = "ARS") {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency, maximumFractionDigits: 0 }).format(amountInCents / 100);
}
