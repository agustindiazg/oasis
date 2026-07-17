import { and, desc, eq } from "drizzle-orm";
import { AdminShell } from "@/components/admin-shell";
import { Icon } from "@/components/icons";
import { getCurrentContext } from "@/lib/current-context";
import { db } from "@/lib/db";
import { billingPeriods, clients } from "@/lib/db/schema";
import { formatMoney } from "@/lib/money";
import { formatDate, paymentStatus, periodLabel } from "@/lib/ui";

export default async function Cobros({ searchParams }: { searchParams: Promise<{ clientId?: string }> }) {
  const { clientId } = await searchParams;
  const context = await getCurrentContext();
  const where = clientId ? and(eq(billingPeriods.organizationId, context.organizationId), eq(billingPeriods.clientId, clientId)) : eq(billingPeriods.organizationId, context.organizationId);
  const rows = await db.select({ id: billingPeriods.id, clientId: clients.id, name: clients.name, dueAt: billingPeriods.dueAt, amount: billingPeriods.amount, currency: billingPeriods.currency, status: billingPeriods.status }).from(billingPeriods).innerJoin(clients, eq(clients.id, billingPeriods.clientId)).where(where).orderBy(desc(billingPeriods.dueAt));
  const clientName = clientId ? rows[0]?.name ?? (await db.select({ name: clients.name }).from(clients).where(and(eq(clients.id, clientId), eq(clients.organizationId, context.organizationId))).limit(1))[0]?.name : undefined;
  const counts = { paid: rows.filter((r) => r.status === "APPROVED").length, pending: rows.filter((r) => r.status === "PENDING" || r.status === "IN_PROCESS").length, overdue: rows.filter((r) => r.status === "OVERDUE" || r.status === "REJECTED").length };

  return <AdminShell><div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[13px] text-black/45">Generados automáticamente según cada plan</p><div className="mt-1 flex flex-wrap items-center gap-3"><h2 className="text-3xl font-bold tracking-[-.06em]">{clientName ? `Cobros de ${clientName}` : "Cobros"}</h2>{clientId && <a href="/admin/cobros" className="rounded-full border border-black/10 px-2.5 py-1 text-[10px] font-bold text-black/50">Quitar filtro ×</a>}</div></div><a href="/admin/preferencias" className="rounded-full bg-[#191b1a] px-4 py-2.5 text-center text-[12px] font-bold text-[#f1f0e9]">Configurar</a></div>
    {!clientId && <div className="mt-8 grid gap-3 sm:grid-cols-4"><Count label="Todos" value={rows.length} /><Count label="Pagados" value={counts.paid} tone="paid" /><Count label="Pendientes" value={counts.pending} tone="pending" /><Count label="Vencidos" value={counts.overdue} tone="overdue" /></div>}
    <div className="mt-8 overflow-x-auto rounded-2xl border border-black/10 bg-[#e8e7df]"><div className="min-w-[650px]"><div className="grid grid-cols-[1.4fr_.9fr_.8fr_.7fr_24px] gap-4 border-b border-black/10 px-5 py-3 text-[9px] uppercase tracking-[.12em] text-black/40"><span>Cliente / período</span><span>Vencimiento</span><span>Monto</span><span>Estado</span><span /></div>{rows.map((period) => { const state = paymentStatus[period.status]; return <a href={`/admin/cobros/${period.id}`} key={period.id} className="grid grid-cols-[1.4fr_.9fr_.8fr_.7fr_24px] items-center gap-4 border-b border-black/10 px-5 py-4 text-[12px] transition last:border-0 hover:bg-[#deddd5]"><span className="font-semibold">{period.name} <span className="font-normal text-black/45">· {periodLabel(period.dueAt)}</span></span><span className="text-black/50">{formatDate(period.dueAt)}</span><span className="font-semibold">{formatMoney(period.amount, period.currency)}</span><span><span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold leading-none ${state.tone}`}>{state.label}</span></span><Icon name="chevron" className="h-4 w-4 text-black/30" /></a>; })}{rows.length === 0 && <p className="px-5 py-14 text-center text-[12px] text-black/45">No hay cobros para mostrar.</p>}</div></div>
  </div></AdminShell>;
}

function Count({ label, value, tone }: { label: string; value: number; tone?: "paid" | "pending" | "overdue" }) {
  const style = tone === "paid" ? "border-[#bfd866] bg-[#e1f39a] text-[#33420d]" : tone === "pending" ? "border-[#e9b77f] bg-[#ffe1bf] text-[#754214]" : tone === "overdue" ? "border-[#e9a2ad] bg-[#ffd5dc] text-[#762332]" : "border-black/10 bg-[#e8e7df]";
  return <div className={`rounded-2xl border p-4 ${style}`}><p className="mono text-[9px] uppercase opacity-60">{label}</p><p className="mt-4 text-2xl font-bold">{value}</p></div>;
}
