import type { billingPlans } from "@/lib/db/schema";
import { PlanActions } from "@/components/plan-actions";

type Plan = typeof billingPlans.$inferSelect;

const statusMeta = {
  ACTIVE: { label: "Activo", tone: "border-[#bfd866] bg-[#e1f39a] text-[#52651c]" },
  PAUSED: { label: "Pausado", tone: "border-[#e9b77f] bg-[#ffe1bf] text-[#754214]" },
  CANCELED: { label: "Cancelado", tone: "border-[#e9a2ad] bg-[#ffd5dc] text-[#762332]" },
} as const;

export function ServicePlanCard({ plan }: { plan?: Plan }) {
  if (!plan) return <section className="h-fit rounded-2xl border border-black/10 bg-[#e8e7df] p-5 sm:p-7"><p className="mono text-[9px] uppercase tracking-[.15em] text-black/40">Servicio y plan</p><p className="mt-5 text-[13px] text-black/45">Este cliente no tiene un plan asociado.</p></section>;
  const state = statusMeta[plan.status];
  return <section className="h-fit rounded-2xl border border-black/10 bg-[#e8e7df] p-5 sm:p-7">
    <div className="flex items-start justify-between gap-4"><div><p className="mono text-[9px] uppercase tracking-[.15em] text-black/40">Servicio y plan</p><h3 className="mt-3 text-xl font-bold tracking-[-.05em]">{plan.serviceName}</h3></div><span className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold ${state.tone}`}>{state.label}</span></div>
    <PlanActions planId={plan.id} status={plan.status} />
  </section>;
}
