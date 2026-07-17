"use client";

import { useState } from "react";

export function TypePlayground() {
  const [text, setText] = useState("Cobrá a tiempo. Trabajá en paz.");
  const [size, setSize] = useState(64);
  const [weight, setWeight] = useState(600);
  const [tracking, setTracking] = useState(-0.06);
  const [mono, setMono] = useState(false);

  return <div className="overflow-hidden rounded-2xl border hairline">
    <div className="flex min-h-[240px] items-center overflow-x-auto bg-paper/[.03] p-6 sm:p-10">
      <p aria-live="off" className={mono ? "mono" : ""} style={{ fontSize: `${size}px`, fontWeight: mono ? Math.min(weight, 500) : weight, letterSpacing: `${tracking}em`, lineHeight: 1.02, textWrap: "balance" }}>{text || "Cobrá a tiempo."}</p>
    </div>
    <div className="grid gap-4 border-t hairline bg-[#0a0a0a] p-5 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="grid gap-4 sm:grid-cols-4">
        <label className="block">
          <span className="mono block text-[9px] uppercase tracking-[.14em] text-[#85877f]">Texto</span>
          <input value={text} onChange={(event) => setText(event.target.value)} maxLength={60} className="mt-2 w-full rounded-full border border-paper/15 bg-transparent px-4 py-2 text-[12px] text-paper outline-none placeholder:text-paper/30 focus:border-acid" placeholder="Escribí algo…" />
        </label>
        <Slider label={`Cuerpo · ${size}px`} min={24} max={110} step={1} value={size} onChange={setSize} />
        <Slider label={`Peso · ${weight}`} min={400} max={800} step={100} value={weight} onChange={setWeight} disabled={mono} />
        <Slider label={`Tracking · ${tracking.toFixed(3)}em`} min={-0.09} max={0.04} step={0.005} value={tracking} onChange={setTracking} />
      </div>
      <div className="flex gap-1.5">
        <button type="button" onClick={() => setMono(false)} aria-pressed={!mono} className={`rounded-full px-4 py-2 text-[11px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid ${mono ? "border border-paper/15 text-[#b6b7b0]" : "bg-paper text-ink"}`}>Manrope</button>
        <button type="button" onClick={() => { setMono(true); setTracking(0.02); }} aria-pressed={mono} className={`mono rounded-full px-4 py-2 text-[11px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid ${mono ? "bg-paper text-ink font-medium" : "border border-paper/15 text-[#b6b7b0]"}`}>DM Mono</button>
      </div>
    </div>
  </div>;
}

function Slider({ label, min, max, step, value, onChange, disabled = false }: { label: string; min: number; max: number; step: number; value: number; onChange: (value: number) => void; disabled?: boolean }) {
  return <label className={`block ${disabled ? "opacity-40" : ""}`}>
    <span className="mono block text-[9px] uppercase tracking-[.14em] text-[#85877f]">{label}</span>
    <input type="range" min={min} max={max} step={step} value={value} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} className="mt-3 w-full accent-[#d7f85b]" />
  </label>;
}
