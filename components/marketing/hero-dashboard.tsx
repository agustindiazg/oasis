"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";

const rows = [
  { name: "Laura Gómez", amount: "$22.000", due: "03 ago", pill: "Pagado", tone: "border-[#bfd866] bg-[#e1f39a] text-[#33420d]", delay: 1.1 },
  { name: "Estudio Norte", amount: "$45.000", due: "05 ago", pill: "Vence mañana", tone: "border-[#e9b77f] bg-[#ffe1bf] text-[#754214]", delay: 1.35 },
  { name: "Martín López", amount: "$18.000", due: "28 jul", pill: "Seguimiento", tone: "border-[#c4b8ed] bg-[#e1dcfa] text-[#4b3d7e]", delay: 1.6 },
  { name: "Valentina Paz", amount: "$18.000", due: "02 ago", pill: "Pagado", tone: "border-[#bfd866] bg-[#e1f39a] text-[#33420d]", delay: 1.85 },
] as const;

export function HeroDashboard() {
  const [total, setTotal] = useState(0);
  const target = 248400;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setTotal(target); return; }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 1600);
      setTotal(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    const timeout = setTimeout(() => { frame = requestAnimationFrame(tick); }, 500);
    return () => { clearTimeout(timeout); cancelAnimationFrame(frame); };
  }, []);

  return <div className="relative">
    <div className="gradient-frame relative z-10 rounded-[1.8rem] p-2.5 sm:p-3">
      <div className="panel-paper grain grain-dark overflow-hidden rounded-[1.35rem] p-5 sm:p-6">
        <div className="stage flex items-center justify-between" style={{ "--d": ".15s" } as React.CSSProperties}>
          <div><p className="mono text-[9px] uppercase tracking-[.16em] text-black/40">Estudio Anda · panel de cobros</p><p className="mt-1.5 text-[15px] font-bold tracking-[-.04em]">Buen día, Ana <span aria-hidden="true" className="text-[#a0a197]">↗</span></p></div>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-violet text-[10px] font-bold text-ink">AT</span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <div className="stage rounded-2xl bg-[#191b1a] p-4 text-[#f1f0e9] max-sm:col-span-2" style={{ "--d": ".35s" } as React.CSSProperties}>
            <p className="mono text-[8px] uppercase tracking-[.15em] text-white/45">Cobrado este mes</p>
            <p className="mt-4 text-[26px] font-bold tabular-nums tracking-[-.05em]">${total.toLocaleString("es-AR")}</p>
            <p className="mt-1 text-[10px] text-acid">14 pagos confirmados</p>
          </div>
          <div className="stage rounded-2xl border border-black/10 bg-[#e8e7df] p-4" style={{ "--d": ".5s" } as React.CSSProperties}>
            <p className="mono text-[8px] uppercase tracking-[.15em] text-black/40">Por cobrar hoy</p>
            <p className="mt-4 text-[26px] font-bold tabular-nums tracking-[-.05em]">$86.000</p>
            <p className="mt-1 text-[10px] text-black/45">4 cobros hasta hoy</p>
          </div>
          <div className="stage rounded-2xl border border-black/10 bg-[#e8e7df] p-4" style={{ "--d": ".65s" } as React.CSSProperties}>
            <p className="mono text-[8px] uppercase tracking-[.15em] text-black/40">Seguimiento</p>
            <p className="mt-4 text-[26px] font-bold tabular-nums tracking-[-.05em]">$18.000</p>
            <p className="mt-1 text-[10px] text-black/45">1 requiere atención</p>
          </div>
        </div>
        <div className="stage mt-5 rounded-2xl border border-black/10 bg-[#e8e7df] p-4" style={{ "--d": ".85s" } as React.CSSProperties}>
          <div className="flex items-center justify-between"><p className="text-[12px] font-bold tracking-[-.03em]">Actividad reciente</p><p className="text-[10px] font-semibold text-black/45">Ver todo →</p></div>
          <div className="mt-2 divide-y divide-black/10">
            {rows.map((row) => <div key={row.name} className="stage grid grid-cols-[minmax(0,1fr)_82px_100px] items-center gap-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_52px_82px_100px]" style={{ "--d": `${row.delay - .25}s` } as React.CSSProperties}>
              <span className="min-w-0 truncate text-[12px] font-semibold">{row.name}</span>
              <span className="mono hidden text-[10px] text-black/40 sm:block">{row.due}</span>
              <span className="text-right text-[12px] font-semibold tabular-nums">{row.amount}</span>
              <span className={`pill-pop inline-flex justify-self-end rounded-full border px-2 py-0.5 text-[9px] font-bold leading-none ${row.tone}`} style={{ "--d": `${row.delay}s` } as React.CSSProperties}>{row.pill}</span>
            </div>)}
          </div>
        </div>
      </div>
    </div>
    <div className="toast-pop absolute -bottom-5 -left-3 z-20 rounded-2xl border hairline bg-[#111111]/95 p-4 shadow-2xl backdrop-blur-xl sm:-left-8">
      <div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-acid/15 text-acid"><Icon name="check" /></span><div><p className="text-[12px] font-bold text-paper">Pago confirmado</p><p className="mono mt-1 text-[9px] text-[#85877f]">Laura Gómez · recién</p></div></div>
    </div>
  </div>;
}
