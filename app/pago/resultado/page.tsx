export default async function PaymentResult({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const ok = status === "success";
  return <main className="grid min-h-screen place-items-center bg-[#191b1a] px-5 text-[#f1f0e9]"><section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center"><span className={`mx-auto grid h-14 w-14 place-items-center rounded-full text-xl ${ok ? "bg-[#d7f85b] text-[#191b1a]" : "bg-[#ffb77e] text-[#191b1a]"}`}>{ok ? "✓" : "…"}</span><h1 className="mt-6 text-3xl font-bold tracking-[-.06em]">{ok ? "Pago recibido" : "Pago en revisión"}</h1><p className="mt-3 text-[13px] leading-6 text-white/55">Estamos confirmando tu pago con Mercado Pago. El estado se actualizará solo.</p><a href="/" className="mt-7 inline-flex rounded-full bg-[#f1f0e9] px-5 py-3 text-[12px] font-bold text-[#191b1a]">Volver a Oasis</a></section></main>;
}
