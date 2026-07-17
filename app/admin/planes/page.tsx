import { and, desc, eq } from "drizzle-orm";
import { AdminShell } from "@/components/admin-shell";
import { archiveServicePlan } from "@/lib/actions/service-plans";
import { getCurrentContext } from "@/lib/current-context";
import { db } from "@/lib/db";
import { billingPlans, servicePlans } from "@/lib/db/schema";
import { formatMoney } from "@/lib/money";
import { frequencyLabel } from "@/lib/ui";

export default async function Planes() {
  const context = await getCurrentContext();
  const [catalog, assignments] = await Promise.all([
    db.select().from(servicePlans).where(and(eq(servicePlans.organizationId, context.organizationId), eq(servicePlans.status, "ACTIVE"))).orderBy(desc(servicePlans.createdAt)),
    db.select({ id: billingPlans.servicePlanId }).from(billingPlans).where(and(eq(billingPlans.organizationId, context.organizationId), eq(billingPlans.status, "ACTIVE"))),
  ]);
  const counts = new Map<string, number>();
  assignments.forEach(({ id }) => id && counts.set(id, (counts.get(id) ?? 0) + 1));
  return <AdminShell><div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[13px] text-black/45">Catálogo compartido del workspace</p><h2 className="mt-1 text-3xl font-bold tracking-[-.06em]">Planes</h2></div><a href="/admin/planes/nuevo" className="rounded-full bg-[#191b1a] px-4 py-2.5 text-center text-[12px] font-bold text-[#f1f0e9]">+ Crear plan</a></div>
    <section className="mt-7 rounded-2xl border border-[#bfd866] bg-[#e1f39a] p-5 sm:p-6"><div className="flex gap-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#d7f85b] text-[#33420d]">↗</span><div><p className="text-[15px] font-bold tracking-[-.03em]">Un precio, todos los clientes.</p><p className="mt-1 max-w-[680px] text-[12px] leading-5 text-[#4e6218]">Asigná un plan a cada cliente. Cuando actualices su precio, Oasis actualiza automáticamente los próximos cobros de todas las personas asignadas.</p></div></div></section>
    <div className="mt-6 grid gap-3 md:grid-cols-2">{catalog.map((plan, index) => <article key={plan.id} className="group rounded-2xl border border-black/10 bg-[#e8e7df] p-5 transition hover:border-black/20 hover:shadow-[0_12px_30px_rgba(25,27,26,.06)]"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold ${index % 3 === 0 ? "bg-[#d7f85b] text-[#33420d]" : index % 3 === 1 ? "bg-[#e1dcfa] text-[#4b3d7e]" : "bg-[#ffe1bf] text-[#754214]"}`}>{counts.get(plan.id) ?? 0} {counts.get(plan.id) === 1 ? "cliente" : "clientes"}</span><h3 className="mt-5 text-xl font-bold tracking-[-.05em]">{plan.name}</h3><p className="mt-1 min-h-5 text-[12px] text-black/45">{plan.description || "Sin descripción"}</p></div><a href={`/admin/planes/${plan.id}/editar`} className="shrink-0 rounded-full border border-black/10 px-3 py-2 text-[11px] font-semibold opacity-70 transition group-hover:opacity-100">Editar</a></div><div className="mt-7 flex items-end justify-between gap-4 border-t border-black/10 pt-5"><div className="min-w-0"><p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-3xl font-bold leading-none tracking-[-.07em]"><span>{formatMoney(plan.amount, plan.currency)}</span><span className="whitespace-nowrap text-[12px] font-semibold tracking-normal text-black/40">/ {frequencyLabel(plan.frequency, plan.dueDay, plan.intervalDays).toLowerCase()}</span></p><p className="mt-2 text-[10px] text-black/45">{plan.frequency === "MONTHLY" ? `Vence el día ${plan.dueDay ?? "—"}` : frequencyLabel(plan.frequency)}</p></div><form className="shrink-0" action={archiveServicePlan}><input type="hidden" name="id" value={plan.id} /><button className="text-[10px] font-semibold text-black/40 hover:text-[#a64252]">Archivar</button></form></div></article>)}{catalog.length === 0 && <div className="rounded-2xl border border-dashed border-black/20 px-5 py-16 text-center md:col-span-2"><p className="text-[15px] font-bold">Todavía no hay planes creados.</p><p className="mt-2 text-[12px] text-black/45">Creá tu primer paquete y asignalo al cargar un cliente.</p><a href="/admin/planes/nuevo" className="mt-5 inline-flex rounded-full bg-[#191b1a] px-4 py-2.5 text-[11px] font-bold text-white">Crear primer plan →</a></div>}</div>
  </div></AdminShell>;
}
