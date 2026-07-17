/* The trust story drawn as a flow: la plata never touches Oasis — it reads states from the side. */
export function MoneyFlow() {
  return <div className="gradient-frame rounded-[1.8rem] p-6 sm:p-10" style={{ "--panel": "#0a0a0a" } as React.CSSProperties}>
    <div className="flex flex-col items-stretch gap-0 sm:flex-row sm:items-center">
      <FlowNode label="Tu cliente" sub="Paga el link" />
      <Connector />
      <FlowNode label="Mercado Pago" sub="Procesa el pago" highlight />
      <Connector />
      <FlowNode label="Tu cuenta" sub="Recibe la plata" />
    </div>
    <div className="mt-10 flex flex-col items-center">
      <div className="h-8 w-px border-l border-dashed border-paper/20" />
      <div className="flex items-center gap-3 rounded-full border hairline bg-[#111111] px-5 py-3">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-acid"><span className="h-1.5 w-1.5 rounded-full bg-ink" /></span>
        <p className="text-[12px] font-bold">Oasis</p>
        <p className="mono text-[9px] uppercase tracking-[.14em] text-[#85877f]">Solo lee estados y vencimientos</p>
      </div>
    </div>
  </div>;
}

function Connector() {
  return <>
    <div className="flow-line flow-line-v mx-auto h-10 w-px sm:hidden" />
    <div className="flow-line hidden h-px flex-1 sm:block" />
  </>;
}

function FlowNode({ label, sub, highlight = false }: { label: string; sub: string; highlight?: boolean }) {
  return <div className={`rounded-2xl border px-6 py-5 text-center sm:min-w-[170px] ${highlight ? "border-acid/40 bg-acid/10" : "hairline bg-paper/[.03]"}`}>
    <p className="text-[13px] font-bold tracking-[-.03em]">{label}</p>
    <p className="mono mt-1.5 text-[9px] uppercase tracking-[.14em] text-[#85877f]">{sub}</p>
  </div>;
}
