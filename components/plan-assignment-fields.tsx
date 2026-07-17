"use client";

import { useState } from "react";

type CatalogPlan = { id: string; name: string; amount: number; currency: string; frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "CUSTOM"; dueDay: number | null };
const input = "mt-2 w-full rounded-xl border border-black/10 bg-[#f1f0e9] px-4 py-3 text-[13px] outline-none transition focus:border-[#191b1a] disabled:cursor-not-allowed disabled:bg-black/[.04] disabled:text-black/45";

export function PlanAssignmentFields({ catalog }: { catalog: CatalogPlan[] }) {
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [dueDay, setDueDay] = useState("10");

  function selectPlan(id: string) {
    setSelectedId(id);
    const plan = catalog.find((item) => item.id === id);
    if (!plan) return;
    setName(plan.name);
    setAmount(String(plan.amount / 100));
    setFrequency(plan.frequency === "CUSTOM" ? "MONTHLY" : plan.frequency);
    setDueDay(String(plan.dueDay ?? 10));
  }

  return <div className="grid gap-4 sm:grid-cols-2">
    <label className="text-[12px] font-semibold sm:col-span-2">Plan del catálogo<select name="servicePlanId" className={input} value={selectedId} onChange={(event) => selectPlan(event.target.value)}><option value="">Plan personalizado para este cliente</option>{catalog.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} · {plan.amount / 100} / {plan.frequency === "MONTHLY" ? "mes" : plan.frequency.toLowerCase()}</option>)}</select><span className="mt-1 block text-[10px] font-normal text-black/45">Elegí un plan existente o dejalo en personalizado.</span></label>
    <label className="text-[12px] font-semibold sm:col-span-2">Servicio principal<input name="serviceName" required disabled={Boolean(selectedId)} className={input} value={name} onChange={(event) => setName(event.target.value)} /></label>
    <label className="text-[12px] font-semibold">Importe<input name="amount" required disabled={Boolean(selectedId)} inputMode="decimal" className={input} value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
    <label className="text-[12px] font-semibold">Moneda<select name="currency" disabled={Boolean(selectedId)} className={input} defaultValue="ARS"><option value="ARS">Pesos argentinos (ARS)</option></select></label>
    <label className="text-[12px] font-semibold">Frecuencia<select name="frequency" disabled={Boolean(selectedId)} className={input} value={frequency} onChange={(event) => setFrequency(event.target.value)}><option value="WEEKLY">Semanal</option><option value="BIWEEKLY">Cada 15 días</option><option value="MONTHLY">Mensual</option></select></label>
    <label className="text-[12px] font-semibold">Día de vencimiento<input name="dueDay" type="number" min="0" max="31" disabled={Boolean(selectedId)} className={input} value={dueDay} onChange={(event) => setDueDay(event.target.value)} /></label>
    {selectedId && <><input type="hidden" name="serviceName" value={name} /><input type="hidden" name="amount" value={amount} /><input type="hidden" name="currency" value="ARS" /><input type="hidden" name="frequency" value={frequency} /><input type="hidden" name="dueDay" value={dueDay} /></>}
    {!selectedId && <label className="flex items-center gap-3 rounded-xl border border-black/10 bg-[#f1f0e9] px-4 py-3 text-[12px] font-semibold sm:col-span-2"><input name="saveAsServicePlan" type="checkbox" /> Guardar este plan personalizado en el catálogo<span className="ml-auto text-[10px] font-normal text-black/40">Opcional</span></label>}
  </div>;
}
