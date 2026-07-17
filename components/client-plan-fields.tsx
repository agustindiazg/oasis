"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

type CatalogPlan = { id: string; name: string; amount: number; currency: string; frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "CUSTOM"; dueDay: number | null };
const input = "mt-2 w-full rounded-xl border border-black/10 bg-[#f1f0e9] px-4 py-3 text-[13px] outline-none transition focus:border-[#191b1a] disabled:cursor-not-allowed disabled:bg-black/[.04] disabled:text-black/45";

export function ClientPlanFields({ catalog, defaultName, defaultAmount, defaultFrequency, defaultDueDay }: { catalog: CatalogPlan[]; defaultName: string; defaultAmount: string; defaultFrequency: string; defaultDueDay: string }) {
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState(defaultName);
  const [amount, setAmount] = useState(defaultAmount);
  const [frequency, setFrequency] = useState(defaultFrequency === "CUSTOM" ? "MONTHLY" : defaultFrequency);
  const [dueDay, setDueDay] = useState(defaultDueDay);
  const [firstCharge, setFirstCharge] = useState("TODAY");

  function handlePlanChange(id: string) {
    setSelectedId(id);
    const plan = catalog.find((item) => item.id === id);
    if (!plan) return;
    setName(plan.name);
    setAmount(String(plan.amount / 100));
    setFrequency(plan.frequency === "CUSTOM" ? "MONTHLY" : plan.frequency);
    setDueDay(String(plan.dueDay ?? 10));
  }

  return <>
    <label className="block text-[12px] font-semibold sm:col-span-2">Plan del catálogo <select name="servicePlanId" className={input} value={selectedId} onChange={(event) => handlePlanChange(event.target.value)}><option value="">Plan personalizado para este cliente</option>{catalog.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} · {plan.amount / 100} / {plan.frequency === "MONTHLY" ? "mes" : plan.frequency.toLowerCase()}</option>)}</select><span className="mt-1 block text-[10px] font-normal leading-4 text-black/45">Elegí un plan para cargar sus valores automáticamente.</span></label>
    <label className="text-[12px] font-semibold sm:col-span-2">Servicio principal<input name="serviceName" required disabled={Boolean(selectedId)} className={input} value={name} onChange={(event) => setName(event.target.value)} /></label>
    <label className="text-[12px] font-semibold">Importe<input name="amount" required inputMode="decimal" disabled={Boolean(selectedId)} className={input} value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
    <label className="text-[12px] font-semibold">Moneda<select name="currency" disabled={Boolean(selectedId)} className={input} defaultValue="ARS"><option value="ARS">Pesos argentinos (ARS)</option></select></label>
    <label className="text-[12px] font-semibold">Frecuencia<select name="frequency" disabled={Boolean(selectedId)} className={input} value={frequency} onChange={(event) => setFrequency(event.target.value)}><option value="WEEKLY">Semanal</option><option value="BIWEEKLY">Cada 15 días</option><option value="MONTHLY">Mensual</option></select></label>
    <label className="text-[12px] font-semibold">Día de vencimiento<input name="dueDay" type="number" min="0" max="31" disabled={Boolean(selectedId)} className={input} value={dueDay} onChange={(event) => setDueDay(event.target.value)} /></label>
    {selectedId && <><input type="hidden" name="serviceName" value={name} /><input type="hidden" name="amount" value={amount} /><input type="hidden" name="currency" value="ARS" /><input type="hidden" name="frequency" value={frequency} /><input type="hidden" name="dueDay" value={dueDay} /></>}
    {!selectedId && <label className="flex items-center gap-3 rounded-xl border border-black/10 bg-[#f1f0e9] px-4 py-3 text-[12px] font-semibold sm:col-span-2"><input name="saveAsServicePlan" type="checkbox" /> Guardar este plan personalizado en el catálogo para usarlo con otros clientes<span className="ml-auto text-[10px] font-normal text-black/40">Opcional</span></label>}
    <div className="flex gap-3 rounded-xl border border-[#bfd866] bg-[#e1f39a] p-4 text-[12px] text-[#33420d] sm:col-span-2"><Icon name="sparkle" className="mt-0.5 h-4 w-4 shrink-0" /><p>{selectedId ? "Este cliente queda vinculado al plan. Si cambiás su precio desde Planes, se actualizan sus próximos cobros." : "Podés dejarlo solo para este cliente o guardarlo como un plan reutilizable."}</p></div>
    <label className="text-[12px] font-semibold">Primer cobro<select name="firstCharge" className={input} value={firstCharge} onChange={(event) => setFirstCharge(event.target.value)}><option value="NEXT">Próximo vencimiento</option><option value="TODAY">Inmediatamente</option><option value="CUSTOM">Elegir una fecha</option></select></label>
    {firstCharge === "CUSTOM" && <label className="text-[12px] font-semibold">Fecha del primer cobro<input name="firstChargeDate" type="date" className={input} /><span className="mt-1 block text-[10px] font-normal leading-4 text-black/45">Elegí cuándo generar el primer período.</span></label>}
  </>;
}
