import { and, asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { Icon } from "@/components/icons";
import { InlineClientDetails } from "@/components/inline-client-details";
import { ServicePlanCard } from "@/components/service-plan-card";
import { getCurrentContext } from "@/lib/current-context";
import { db } from "@/lib/db";
import { billingPeriods, billingPlans, clients } from "@/lib/db/schema";
import { formatMoney } from "@/lib/money";
import { formatDate, frequencyLabel, initials, paymentStatus, periodLabel } from "@/lib/ui";

export default async function ClienteDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getCurrentContext();
  const [client] = await db.select().from(clients).where(and(eq(clients.id, id), eq(clients.organizationId, context.organizationId))).limit(1);
  if (!client) notFound();

  const [plans, periods] = await Promise.all([
    db.select().from(billingPlans).where(and(eq(billingPlans.clientId, client.id), eq(billingPlans.organizationId, context.organizationId))).orderBy(asc(billingPlans.canceledAt), desc(billingPlans.createdAt)).limit(1),
    db.select().from(billingPeriods).where(and(eq(billingPeriods.clientId, client.id), eq(billingPeriods.organizationId, context.organizationId))).orderBy(desc(billingPeriods.dueAt)).limit(24),
  ]);
  const plan = plans[0];
  const open = periods.filter((period) => ["PENDING", "IN_PROCESS", "OVERDUE", "REJECTED"].includes(period.status));
  const owed = open.reduce((sum, period) => sum + period.amount, 0);
  const next = open.reduce<(typeof open)[number] | undefined>((earliest, period) => !earliest || period.dueAt < earliest.dueAt ? period : earliest, undefined);
  const hasOverdue = open.some((period) => period.status === "OVERDUE" || period.status === "REJECTED");
  const clientState = hasOverdue ? "Vencido" : open.length ? "Pendiente" : "Al día";
  const stateTone = hasOverdue ? paymentStatus.OVERDUE.tone : open.length ? paymentStatus.PENDING.tone : paymentStatus.APPROVED.tone;

  return <AdminShell><div className="mx-auto max-w-[1050px] px-5 py-8 sm:px-8">
    <a href="/admin/clientes" className="text-[12px] font-semibold text-black/50 hover:text-black">← Volver a clientes</a>
    <div className="mt-8 flex flex-col justify-between gap-5 border-b border-black/10 pb-8 sm:flex-row sm:items-end">
      <div className="flex items-center gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#d7f85b] text-[14px] font-bold">{initials(client.name)}</span><div><p className="mono text-[9px] uppercase tracking-[.16em] text-black/40">Ficha de cliente</p><h2 className="mt-2 text-3xl font-bold tracking-[-.07em] sm:text-4xl">{client.name}</h2><p className="mt-1 text-[13px] text-black/45">{client.email ?? "Sin email"}{client.phone ? ` · ${client.phone}` : ""}</p></div></div>
      <span className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-[11px] font-bold ${stateTone}`}>{clientState}</span>
    </div>

    <div className="mt-8 grid gap-3 sm:grid-cols-3">
      <div className={`rounded-2xl p-5 ${hasOverdue ? "bg-[#762332] text-white" : "bg-[#191b1a] text-[#f1f0e9]"}`}><p className="mono text-[9px] uppercase tracking-[.15em] opacity-60">Nos debe hoy</p><p className="mt-6 text-4xl font-bold tracking-[-.07em]">{formatMoney(owed, plan?.currency ?? "ARS")}</p><p className="mt-2 text-[11px] opacity-60">Según pagos confirmados</p></div>
      <div className="rounded-2xl border border-black/10 bg-[#e8e7df] p-5"><p className="mono text-[9px] uppercase tracking-[.15em] text-black/40">Próximo cobro abierto</p><p className="mt-6 text-2xl font-bold tracking-[-.06em]">{next ? formatMoney(next.amount, next.currency) : "—"}</p><p className="mt-2 text-[11px] text-black/45">{next ? `Vence ${formatDate(next.dueAt)}` : "Sin cobros pendientes"}</p></div>
      <div className="rounded-2xl border border-black/10 bg-[#e8e7df] p-5"><p className="mono text-[9px] uppercase tracking-[.15em] text-black/40">Plan</p><p className="mt-6 text-xl font-bold tracking-[-.05em]">{plan ? frequencyLabel(plan.frequency, plan.dueDay, plan.intervalDays) : "Sin plan"}</p><p className="mt-2 text-[11px] text-black/45">{plan?.status === "ACTIVE" ? "Generación automática" : plan?.status === "PAUSED" ? "Pausado" : "Cancelado"}</p></div>
    </div>

    <InlineClientDetails clientId={client.id} initialDate={client.startedAt.toISOString().slice(0, 10)} initialFormattedDate={formatDate(client.startedAt, true)} initialNotes={client.notes ?? ""} />

    <div className="mt-8 grid items-start gap-4 lg:grid-cols-[1.25fr_.75fr]">
      <section className="h-fit rounded-2xl border border-black/10 bg-[#e8e7df] p-5 sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="mono text-[9px] uppercase tracking-[.15em] text-black/40">Historial de cobros</p><h3 className="mt-3 text-xl font-bold tracking-[-.05em]">Actividad de {client.name.split(" ")[0]}</h3></div><a href={`/admin/cobros?clientId=${client.id}`} className="shrink-0 text-[12px] font-semibold text-black/55">Ver todos <Icon name="arrow" className="ml-1 inline h-3 w-3" /></a></div><div className="mt-6 overflow-x-auto border-t border-black/10"><div className="min-w-[520px]"><div className="grid grid-cols-[1.2fr_.9fr_.8fr_.8fr_20px] gap-3 border-b border-black/10 px-4 py-3 text-[9px] uppercase tracking-[.1em] text-black/40"><span>Período</span><span>Vencimiento</span><span>Monto</span><span>Estado</span><span /></div>{periods.map((period) => { const state = paymentStatus[period.status]; return <a href={`/admin/cobros/${period.id}`} key={period.id} className="grid grid-cols-[1.2fr_.9fr_.8fr_.8fr_20px] items-center gap-3 border-b border-black/10 px-4 py-4 text-[11px] last:border-0 hover:bg-[#deddd5]"><span className="font-semibold">{periodLabel(period.dueAt)}</span><span className="text-black/50">{formatDate(period.dueAt)}</span><span className="font-semibold">{formatMoney(period.amount, period.currency)}</span><span className={`inline-flex w-fit rounded-full border px-2 py-1 text-[9px] font-bold ${state.tone}`}>{state.label}</span><Icon name="chevron" className="h-4 w-4 text-black/30" /></a>; })}</div></div></section>
      <ServicePlanCard plan={plan} />
    </div>
  </div></AdminShell>;
}
