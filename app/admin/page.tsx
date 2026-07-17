import { and, desc, eq } from "drizzle-orm";
import { AdminShell } from "@/components/admin-shell";
import { Icon } from "@/components/icons";
import { getCurrentContext } from "@/lib/current-context";
import { db } from "@/lib/db";
import { billingPeriods, businessSettings, clients, paymentConnections } from "@/lib/db/schema";
import { formatMoney } from "@/lib/money";
import { formatDate, paymentStatus } from "@/lib/ui";

export default async function Admin() {
  const context = await getCurrentContext();
  const [periods, activeClients, settings, connection] = await Promise.all([
    db.select({ id: billingPeriods.id, clientId: clients.id, name: clients.name, dueAt: billingPeriods.dueAt, amount: billingPeriods.amount, currency: billingPeriods.currency, status: billingPeriods.status, paidAt: billingPeriods.paidAt }).from(billingPeriods).innerJoin(clients, eq(clients.id, billingPeriods.clientId)).where(eq(billingPeriods.organizationId, context.organizationId)).orderBy(desc(billingPeriods.updatedAt)).limit(100),
    db.select({ id: clients.id }).from(clients).where(and(eq(clients.organizationId, context.organizationId), eq(clients.status, "ACTIVE"))),
    db.select({ currency: businessSettings.defaultCurrency, businessName: businessSettings.businessName }).from(businessSettings).where(eq(businessSettings.organizationId, context.organizationId)).limit(1),
    db.select({ status: paymentConnections.status }).from(paymentConnections).where(and(eq(paymentConnections.organizationId, context.organizationId), eq(paymentConnections.provider, "MERCADO_PAGO"))).limit(1),
  ]);
  const currentSettings = settings[0];
  const currentConnection = connection[0];
  const currency = currentSettings?.currency ?? "ARS";
  const now = new Date();
  const paidThisMonth = periods.filter((p) => p.currency === currency && p.status === "APPROVED" && p.paidAt && p.paidAt.getMonth() === now.getMonth() && p.paidAt.getFullYear() === now.getFullYear()).reduce((sum, p) => sum + p.amount, 0);
  const open = periods.filter((p) => p.currency === currency && ["PENDING", "IN_PROCESS", "OVERDUE", "REJECTED"].includes(p.status));
  const overdue = open.filter((p) => p.status === "OVERDUE" || p.status === "REJECTED");
  const openAmount = open.filter((p) => p.dueAt <= now).reduce((sum, p) => sum + p.amount, 0);
  const setup = { payment: currentConnection?.status === "CONNECTED", client: activeClients.length > 0, settings: Boolean(currentSettings) };

  return <AdminShell><div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8">
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[13px] text-black/45">Tu negocio, en calma.</p><h2 className="mt-1 text-3xl font-bold tracking-[-.06em]">Resumen de cobros</h2></div><a href="/admin/clientes/nuevo" className="rounded-full bg-[#191b1a] px-4 py-2.5 text-center text-[12px] font-bold text-[#f1f0e9]">+ Nuevo cliente</a></div>
    {(!setup.payment || !setup.client) && <section className="mb-5 rounded-2xl border border-[#bfd866] bg-[#e1f39a] p-5"><p className="mono text-[9px] uppercase tracking-[.15em] text-[#4e6218]">Primeros pasos</p><h3 className="mt-3 text-xl font-bold tracking-[-.04em]">Dejá Oasis listo para cobrar</h3><div className="mt-4 grid gap-2 text-[12px] sm:grid-cols-2"><a href="/admin/preferencias" className={`rounded-xl border px-3 py-3 font-semibold ${setup.payment ? "border-black/10 bg-white/30 text-black/45 line-through" : "border-black/15 bg-white/60"}`}>{setup.payment ? "✓ Mercado Pago conectado" : "1. Conectar Mercado Pago →"}</a><a href="/admin/clientes/nuevo" className={`rounded-xl border px-3 py-3 font-semibold ${setup.client ? "border-black/10 bg-white/30 text-black/45 line-through" : "border-black/15 bg-white/60"}`}>{setup.client ? "✓ Primer cliente creado" : "2. Crear primer cliente →"}</a></div></section>}
    <div className="grid gap-3 sm:grid-cols-3"><Metric dark label="Cobrado este mes" value={formatMoney(paidThisMonth, currency)} note={`Pagos confirmados en ${currency}`} /><Metric label="Vencido / rechazado" value={formatMoney(overdue.filter((p) => p.currency === currency).reduce((sum, p) => sum + p.amount, 0), currency)} note={`${overdue.length} requieren seguimiento`} /><Metric label="Por cobrar hoy" value={formatMoney(openAmount, currency)} note={`${open.filter((p) => p.dueAt <= now).length} cobros hasta hoy`} /></div>
    <div className="mt-8 rounded-2xl border border-black/10 bg-[#e8e7df] p-5 sm:p-6"><div className="flex items-center justify-between"><div><h3 className="text-[15px] font-bold tracking-[-.03em]">Actividad reciente</h3><p className="mt-1 text-[11px] text-black/45">Los últimos movimientos de tu cuenta</p></div><a href="/admin/cobros" className="text-[12px] font-semibold text-black/55">Ver todo <Icon name="arrow" className="ml-1 inline h-3 w-3" /></a></div>
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-[12px]"><thead className="border-b border-black/10 text-[10px] uppercase tracking-[.12em] text-black/40"><tr><th className="pb-3 font-medium">Cliente</th><th className="pb-3 font-medium">Vencimiento</th><th className="pb-3 font-medium">Monto</th><th className="pb-3 font-medium">Estado</th><th /></tr></thead><tbody>{periods.slice(0, 6).map((period) => { const state = paymentStatus[period.status]; const href = `/admin/cobros/${period.id}`; return <tr key={period.id} className="group border-b border-black/10 transition last:border-0 hover:bg-[#deddd5]"><td className="py-4 font-semibold"><a className="block focus:underline focus:outline-none" href={href}>{period.name}</a></td><td className="py-4 text-black/50"><a className="block focus:underline focus:outline-none" href={href}>{formatDate(period.dueAt)}</a></td><td className="py-4 font-semibold"><a className="block focus:underline focus:outline-none" href={href}>{formatMoney(period.amount, period.currency)}</a></td><td className="py-4"><a className="block focus:outline-none" href={href} aria-label={`Ver cobro de ${period.name}`}><span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold leading-none ${state.tone}`}>{state.label}</span></a></td><td className="py-4 text-right"><a aria-label={`Ver cobro de ${period.name}`} href={href}><Icon name="chevron" className="ml-auto h-4 w-4 text-black/30 transition group-hover:translate-x-0.5 group-hover:text-black/60" /></a></td></tr>; })}</tbody></table>{periods.length === 0 && <p className="py-12 text-center text-[12px] text-black/45">Todavía no hay cobros. Agregá tu primer cliente.</p>}</div>
    </div>
  </div></AdminShell>;
}

function Metric({ label, value, note, dark = false }: { label: string; value: string; note: string; dark?: boolean }) {
  return <div className={`rounded-2xl p-5 ${dark ? "bg-[#191b1a] text-[#f1f0e9]" : "border border-black/10 bg-[#e8e7df]"}`}><p className={`mono text-[9px] uppercase tracking-[.15em] ${dark ? "text-white/45" : "text-black/40"}`}>{label}</p><p className="mt-7 text-3xl font-bold tracking-[-.06em]">{value}</p><p className={`mt-2 text-[11px] ${dark ? "text-[#d7f85b]" : "text-black/45"}`}>{note}</p></div>;
}
