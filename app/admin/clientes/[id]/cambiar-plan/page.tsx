import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { PlanAssignmentFields } from "@/components/plan-assignment-fields";
import { assignClientPlan } from "@/lib/actions/clients";
import { getCurrentContext } from "@/lib/current-context";
import { db } from "@/lib/db";
import { billingPlans, clients, servicePlans } from "@/lib/db/schema";

export default async function CambiarPlan({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getCurrentContext();
  const [[client], [currentPlan], catalog] = await Promise.all([
    db.select().from(clients).where(and(eq(clients.id, id), eq(clients.organizationId, context.organizationId))).limit(1),
    db.select().from(billingPlans).where(and(eq(billingPlans.clientId, id), eq(billingPlans.organizationId, context.organizationId))).orderBy(desc(billingPlans.createdAt)).limit(1),
    db.select().from(servicePlans).where(and(eq(servicePlans.organizationId, context.organizationId), eq(servicePlans.status, "ACTIVE"))).orderBy(servicePlans.name),
  ]);
  if (!client || !currentPlan) notFound();
  return <AdminShell><div className="mx-auto max-w-[760px] px-5 py-8 sm:px-8"><a href={`/admin/clientes/${client.id}`} className="text-[12px] font-semibold text-black/50">← Volver al cliente</a><div className="mt-8"><p className="mono text-[9px] uppercase tracking-[.16em] text-black/40">Cliente · cambio de plan</p><h2 className="mt-3 text-4xl font-bold tracking-[-.07em]">Cambiar plan de {client.name}</h2><p className="mt-2 text-[13px] text-black/45">El plan nuevo se aplica a los próximos cobros. El historial anterior queda intacto.</p></div><section className="mt-8 rounded-2xl border border-black/10 bg-[#e8e7df] p-5 sm:p-7"><p className="mono text-[9px] uppercase tracking-[.15em] text-black/40">Plan actual</p><p className="mt-3 text-xl font-bold tracking-[-.05em]">{currentPlan.serviceName}</p><p className="mt-1 text-[12px] text-black/45">{currentPlan.amount / 100} · {currentPlan.frequency === "MONTHLY" ? "Mensual" : currentPlan.frequency === "WEEKLY" ? "Semanal" : "Cada 15 días"}</p></section><form action={assignClientPlan} className="mt-4 rounded-2xl border border-black/10 bg-[#e8e7df] p-5 sm:p-7"><input type="hidden" name="clientId" value={client.id} /><input type="hidden" name="billingPlanId" value={currentPlan.id} /><PlanAssignmentFields catalog={catalog.filter((plan) => plan.id !== currentPlan.servicePlanId)} /><div className="mt-7 flex justify-end gap-2"><a href={`/admin/clientes/${client.id}`} className="rounded-full border border-black/10 px-5 py-3 text-[12px] font-semibold">Cancelar</a><button className="rounded-full bg-[#191b1a] px-5 py-3 text-[12px] font-bold text-white">Asignar nuevo plan →</button></div></form></div></AdminShell>;
}
