"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";

const steps = [
  {
    label: "01 · Link enviado",
    title: "El link sale solo.",
    body: "El primero de cada mes, Oasis genera el período y le manda el link de pago a tu cliente. Vos no hiciste nada.",
    accent: "#eae9e2",
    pill: { text: "Link enviado", tone: "border-black/15 bg-black/5 text-black/55" },
    meta: "Enviado a Valentina · 01 ago · 09:00",
    detail: "oasis.app/p/valen-entrenamiento",
  },
  {
    label: "02 · Pagado",
    title: "Pagado, sin preguntar.",
    body: "Mercado Pago confirma el pago y Oasis lo refleja al instante. La plata ya está en tu cuenta — nunca pasó por la nuestra.",
    accent: "#d7f85b",
    pill: { text: "Pagado", tone: "border-[#bfd866] bg-[#e1f39a] text-[#33420d]" },
    meta: "Confirmado · 03 ago · 21:14",
    detail: "$18.000 acreditados en tu Mercado Pago",
  },
  {
    label: "03 · Un mes después",
    title: "Se acerca el vencimiento.",
    body: "El período nuevo nació solo. Oasis te muestra qué vence antes de que sea un problema, no después.",
    accent: "#ffb77e",
    pill: { text: "Vence mañana", tone: "border-[#e9b77f] bg-[#ffe1bf] text-[#754214]" },
    meta: "Próximo vencimiento · 05 sep",
    detail: "Aviso programado para hoy, 18:00",
  },
  {
    label: "04 · Seguimiento",
    title: "Seguimiento con tacto.",
    body: "Si no pagó, Oasis prepara un recordatorio claro y humano. Cuidás tu caja sin arruinar el vínculo.",
    accent: "#9f8bff",
    pill: { text: "Seguimiento", tone: "border-[#c4b8ed] bg-[#e1dcfa] text-[#4b3d7e]" },
    meta: "Recordatorio listo para enviar",
    detail: "“Hola Valen! Te dejo el link de nuevo…”",
  },
] as const;

export function VidaCobro() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const index = refs.current.indexOf(entry.target as HTMLDivElement);
        if (index >= 0) setActive(index);
      }
    }, { rootMargin: "-45% 0px -45% 0px" });
    for (const node of refs.current) if (node) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const step = steps[active];

  return <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
    <div className="lg:order-2">
      <div className="lg:sticky lg:top-28">
        <div className="gradient-frame rounded-[1.8rem] p-2.5 transition-shadow duration-500" style={{ boxShadow: `0 0 90px -30px ${step.accent}55` }}>
          <div className="panel-paper grain grain-dark rounded-[1.35rem] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#191b1a] text-[10px] font-bold text-[#f1f0e9]">VP</span><div><p className="text-[13px] font-bold tracking-[-.03em]">Valentina Paz</p><p className="text-[10px] text-black/45">Entrenamiento funcional · $18.000/mes</p></div></div>
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold leading-none transition-all duration-500 ${step.pill.tone}`}>{step.pill.text}</span>
            </div>
            <div className="relative mt-6 h-[92px]">
              {steps.map((state, index) => <div key={state.label} className={`vida-state absolute inset-0 ${index === active ? "" : "vida-hidden"}`}>
                <p className="mono text-[9px] uppercase tracking-[.15em] text-black/40">{state.meta}</p>
                <p className="mt-3 rounded-2xl border border-black/10 bg-[#e8e7df] px-4 py-3 text-[12px] font-semibold leading-5">{state.detail}</p>
              </div>)}
            </div>
            <div className="mt-5 flex items-center gap-1.5 border-t border-black/10 pt-4" role="tablist" aria-label="Etapas del cobro">
              {steps.map((state, index) => <button key={state.label} type="button" role="tab" aria-selected={index === active} aria-label={state.label} onClick={() => { setActive(index); if (window.matchMedia("(min-width: 1024px)").matches) refs.current[index]?.scrollIntoView({ block: "center", behavior: "smooth" }); }} className="h-1.5 flex-1 rounded-full transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40" style={{ backgroundColor: index <= active ? step.accent === "#eae9e2" ? "#191b1a" : step.accent : "rgba(0,0,0,.12)" }} />)}
            </div>
          </div>
        </div>
        <p className="mono mt-4 text-center text-[9px] uppercase tracking-[.16em] text-[#6f716b] lg:hidden">Tocá las etapas para recorrer el cobro</p>
      </div>
    </div>
    <div className="relative lg:order-1">
      <div aria-hidden className="absolute inset-y-0 left-[11px] w-px bg-gradient-to-b from-transparent via-paper/15 to-transparent" />
      {steps.map((state, index) => {
        const [num, name] = state.label.split(" · ");
        return <div key={state.label} ref={(node) => { refs.current[index] = node; }} className="py-6 lg:flex lg:min-h-[42vh] lg:flex-col lg:justify-center lg:py-8">
          <p className="mono flex items-center gap-4 text-[10px] uppercase tracking-[.18em] transition-colors duration-500" style={{ color: index === active ? state.accent : "#555850" }}>
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border bg-[#080808] text-[9px] font-bold transition-colors duration-500" style={{ borderColor: index === active ? state.accent : index < active ? "rgba(241,240,233,.3)" : "rgba(241,240,233,.14)", color: index === active ? state.accent : index < active ? "#a9aaa3" : "#555850" }}>{num}</span>
            {name}
          </p>
          <h3 className={`display mt-4 pl-10 text-4xl font-semibold transition-opacity duration-500 sm:text-5xl ${index === active ? "" : "lg:opacity-30"}`}>{state.title}</h3>
          <p className={`mt-4 max-w-[420px] pl-10 text-[15px] leading-7 text-[#a9aaa3] transition-opacity duration-500 ${index === active ? "" : "lg:opacity-30"}`}>{state.body}</p>
          {index === 1 && <p className={`mono mt-4 flex items-center gap-2 pl-10 text-[10px] uppercase tracking-[.15em] text-acid transition-opacity duration-500 ${index === active ? "" : "lg:opacity-30"}`}><Icon name="check" className="h-3.5 w-3.5" /> Directo a tu cuenta</p>}
        </div>;
      })}
    </div>
  </div>;
}
