"use client";

import { useEffect, useRef, useState } from "react";

/* El mes sin Oasis: the monthly chase, rendered as the artifacts it actually lives in. */
export function ChaosCollage() {
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

  return <div ref={ref} aria-hidden="true" className={`story relative mx-auto w-full max-w-[500px] pb-10 ${play ? "play" : ""}`}>
    <div className="relative z-10 w-[86%]">
      <div className="rotate-[-1.5deg] rounded-2xl bg-paper p-4 text-ink shadow-2xl">
        <div className="flex items-center gap-2.5 border-b border-black/10 pb-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#191b1a] text-[9px] font-bold text-[#f1f0e9]">VP</span>
          <div><p className="text-[12px] font-bold leading-none">Valentina Paz</p><p className="mono mt-1 text-[9px] text-black/40">en línea</p></div>
        </div>
        <div className="ml-auto mt-3 w-fit max-w-[85%] rounded-xl rounded-br-sm bg-[#e8e7df] px-3.5 py-2.5">
          <p className="text-[12px] font-semibold leading-5">Hola! ¿Pudiste hacer la transferencia?</p>
          <p className="mono mt-1.5 text-right text-[8px] text-black/40">21:10 ✓✓</p>
        </div>
        <div className="ml-auto mt-2 w-fit max-w-[85%] rounded-xl rounded-br-sm bg-[#e8e7df] px-3.5 py-2.5">
          <p className="text-[12px] font-semibold leading-5">Te reenvío el alias por las dudas</p>
          <p className="mono mt-1.5 text-right text-[8px] text-black/40">21:12 ✓✓</p>
        </div>
        <p className="mono mt-3 text-center text-[9px] uppercase tracking-[.13em] text-black/35">Visto · sin respuesta</p>
      </div>
    </div>

    <div className="relative -mt-9 ml-auto w-[88%]">
      <div className="rotate-[1.2deg] overflow-hidden rounded-xl border border-black/10 bg-paper text-ink shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/10 bg-[#e8e7df] px-3.5 py-2">
          <p className="mono text-[9px] text-black/50">cobros_2026 · hoja 3</p>
          <p className="mono text-[9px] text-black/30">sin guardar</p>
        </div>
        <table className="mono w-full text-[10px]">
          <thead>
            <tr className="border-b border-black/10 bg-[#e8e7df]/60 text-[8px] uppercase tracking-[.1em] text-black/40">
              <th className="border-r border-black/10 px-3 py-1.5 text-left font-medium">Cliente</th>
              <th className="border-r border-black/10 px-3 py-1.5 text-right font-medium">Monto</th>
              <th className="px-3 py-1.5 text-left font-medium">¿Pagó?</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black/10"><td className="border-r border-black/10 px-3 py-2">Euge</td><td className="border-r border-black/10 px-3 py-2 text-right tabular-nums">22.000</td><td className="px-3 py-2 text-black/50">ok</td></tr>
            <tr className="border-b border-black/10"><td className="border-r border-black/10 px-3 py-2">Martín</td><td className="border-r border-black/10 px-3 py-2 text-right tabular-nums">18.000</td><td className="bg-[#ffe1bf] px-3 py-2 font-bold text-[#754214] outline outline-2 -outline-offset-1 outline-[#191b1a]">PAGÓ??</td></tr>
            <tr className="border-b border-black/10"><td className="border-r border-black/10 px-3 py-2">Estudio N</td><td className="border-r border-black/10 px-3 py-2 text-right tabular-nums">45.000</td><td className="px-3 py-2 font-bold text-[#762332]">????</td></tr>
            <tr><td className="border-r border-black/10 px-3 py-2">Caro</td><td className="border-r border-black/10 px-3 py-2 text-right tabular-nums">19.500</td><td className="px-3 py-2 text-black/25">—</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="absolute -bottom-2 left-3 z-20 w-44">
      <div className="drift relative rotate-[-4deg] rounded-sm bg-[#e1f39a] p-4 pt-5 text-ink shadow-xl">
        <span className="absolute -top-1.5 left-1/2 h-3.5 w-12 -translate-x-1/2 rotate-2 rounded-[2px] bg-white/60 shadow-sm" />
        <p className="mono text-[10px] font-medium leading-4">acordarme de cobrarle a Martín!!</p>
      </div>
    </div>
  </div>;
}
