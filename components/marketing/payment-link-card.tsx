"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";

/* Chapter 02 as a sequence: the link goes out, the payment lands, the panel updates. */
export function PaymentLinkCard() {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setPlay(true); observer.disconnect(); }
    }, { threshold: 0.35 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`story mx-auto w-full max-w-[420px] ${play ? "play" : ""}`}>
    <div className="ml-auto w-[88%] rounded-2xl rounded-br-sm bg-paper p-4 text-ink shadow-xl">
      <p className="mono text-[9px] uppercase tracking-[.14em] text-black/40">Para Valentina · por WhatsApp</p>
      <div className="mt-3 rounded-xl border border-black/10 bg-[#e8e7df] p-4">
        <p className="mono text-[10px] text-black/45">oasis.app/p/<span className="text-black/80">valen-entrenamiento</span></p>
        <div className="mt-3 flex items-end justify-between gap-3"><p className="text-[12px] font-bold tracking-[-.03em]">Entrenamiento funcional</p><p className="text-[17px] font-bold tabular-nums tracking-[-.05em]">$18.000</p></div>
        <div className="mt-4 rounded-full bg-[#191b1a] px-4 py-2.5 text-center text-[11px] font-bold text-[#f1f0e9]">Pagar con Mercado Pago</div>
      </div>
      <p className="mono mt-2 text-right text-[9px] text-black/40">21:10 ✓✓</p>
    </div>

    <p className="mono mt-4 text-[9px] uppercase tracking-[.16em] text-[#6f716b]">Valentina abrió el link · 21:12</p>

    <div className="mt-4 w-[88%] rounded-2xl rounded-bl-sm border border-[#bfd866] bg-paper p-4 text-ink shadow-xl">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-acid text-ink"><Icon name="check" className="h-4 w-4" /></span>
        <div className="min-w-0 flex-1"><p className="text-[13px] font-bold tracking-[-.03em]">Pago acreditado</p><p className="mono mt-0.5 text-[9px] uppercase tracking-[.13em] text-black/40">03 ago · 21:14 · Mercado Pago</p></div>
        <p className="text-[15px] font-bold tabular-nums tracking-[-.04em]">$18.000</p>
      </div>
    </div>

    <div className="mt-4 rounded-2xl border hairline bg-paper/[.03] p-4">
      <p className="mono text-[9px] uppercase tracking-[.15em] text-[#6f716b]">Y en tu panel, solo</p>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_78px_86px] items-center gap-3">
        <span className="truncate text-[12px] font-semibold text-paper">Valentina Paz</span>
        <span className="text-right text-[12px] font-semibold tabular-nums text-paper">$18.000</span>
        <span className="inline-flex justify-self-end rounded-full border border-[#bfd866] bg-[#e1f39a] px-2 py-0.5 text-[9px] font-bold leading-none text-[#33420d]">Pagado</span>
      </div>
    </div>
  </div>;
}
