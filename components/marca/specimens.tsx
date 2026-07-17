"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

const pills = [
  ["Pagado", "border-[#bfd866] bg-[#e1f39a] text-[#33420d]"],
  ["Vence mañana", "border-[#e9b77f] bg-[#ffe1bf] text-[#754214]"],
  ["Seguimiento", "border-[#c4b8ed] bg-[#e1dcfa] text-[#4b3d7e]"],
  ["Rechazado", "border-[#e9a2ad] bg-[#ffd5dc] text-[#762332]"],
] as const;

/* Real product components as living specimens, re-themeable between papel and tinta. */
export function Specimens() {
  const [dark, setDark] = useState(false);

  return <div className="overflow-hidden rounded-2xl border hairline">
    <div className="flex items-center justify-between border-b hairline bg-[#0a0a0a] px-5 py-3">
      <p className="mono text-[9px] uppercase tracking-[.15em] text-[#85877f]">Especímenes vivos · del producto real</p>
      <div className="flex gap-1.5">
        <button type="button" onClick={() => setDark(false)} aria-pressed={!dark} className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid ${dark ? "border border-paper/15 text-[#b6b7b0]" : "bg-paper text-ink"}`}>Papel</button>
        <button type="button" onClick={() => setDark(true)} aria-pressed={dark} className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid ${dark ? "bg-paper text-ink" : "border border-paper/15 text-[#b6b7b0]"}`}>Tinta</button>
      </div>
    </div>
    <div className={`grid gap-6 p-6 transition-colors duration-500 sm:grid-cols-2 sm:p-8 ${dark ? "bg-[#0b0b0b] text-paper" : "bg-[#f1f0e9] text-[#191b1a]"}`}>
      <div>
        <p className={`mono text-[9px] uppercase tracking-[.15em] ${dark ? "text-white/40" : "text-black/40"}`}>Estados de cobro</p>
        <div className="mt-4 flex flex-wrap gap-2">{pills.map(([label, tone]) => <span key={label} className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold leading-none ${tone}`}>{label}</span>)}</div>
        <p className={`mono mt-8 text-[9px] uppercase tracking-[.15em] ${dark ? "text-white/40" : "text-black/40"}`}>Acciones</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-4 py-2.5 text-[12px] font-bold ${dark ? "bg-acid text-ink" : "bg-[#191b1a] text-[#f1f0e9]"}`}>Pedir acceso anticipado <Icon name="arrow" className="ml-1 inline h-3.5 w-3.5" /></span>
          <span className={`rounded-full border px-4 py-2.5 text-[12px] font-semibold ${dark ? "border-paper/20" : "border-black/15"}`}>Ver cobros</span>
        </div>
      </div>
      <div className={`rounded-2xl border p-5 ${dark ? "border-paper/10 bg-white/[.03]" : "border-black/10 bg-[#e8e7df]"}`}>
        <div className="flex items-center justify-between"><p className={`mono text-[8px] uppercase tracking-[.15em] ${dark ? "text-white/40" : "text-black/40"}`}>Cobrado este mes</p><span className="grid h-7 w-7 place-items-center rounded-full bg-violet text-[9px] font-bold text-ink">AT</span></div>
        <p className="mt-6 text-[28px] font-bold tabular-nums tracking-[-.06em]">$248.400</p>
        <p className={`mt-1 text-[11px] ${dark ? "text-acid" : "text-black/45"}`}>14 pagos confirmados</p>
      </div>
    </div>
  </div>;
}
