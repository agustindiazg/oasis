import { updatePlanStatus } from "@/lib/actions/plans";

export function PlanActions({ planId, clientId, status }: { planId: string; clientId: string; status: "ACTIVE" | "PAUSED" | "CANCELED" }) {
  const changePlanHref = `/admin/clientes/${clientId}/cambiar-plan`;
  return <div className="mt-5 border-t border-black/10 pt-4">
    {status === "ACTIVE" ? <div className="flex flex-wrap gap-2"><a href={changePlanHref} className="rounded-full bg-[#191b1a] px-3.5 py-2 text-[10px] font-bold text-white">Cambiar plan</a><Action planId={planId} action="pause" label="Pausar" tone="border-black/10 text-black/60 hover:bg-black/5" /><Action planId={planId} action="cancel" label="Dar de baja" tone="border-[#e9a2ad] text-[#762332] hover:bg-[#ffd5dc]" /></div> : <div><p className="text-[11px] leading-5 text-black/45">No se generarán nuevos períodos. El historial anterior se conserva.</p><div className="mt-3 flex flex-wrap gap-2"><Action planId={planId} action="reactivate" label="Reactivar plan" tone="border-[#bfd866] bg-[#e1f39a] text-[#52651c]" /><a href={changePlanHref} className="rounded-full border border-black/10 px-3.5 py-2 text-[10px] font-bold">Cambiar plan</a></div></div>}
  </div>;
}

function Action({ planId, action, label, tone }: { planId: string; action: string; label: string; tone: string }) {
  return <form action={updatePlanStatus}><input type="hidden" name="planId" value={planId} /><input type="hidden" name="action" value={action} /><button className={`rounded-full border px-3.5 py-2 text-[10px] font-bold transition ${tone}`}>{label}</button></form>;
}
