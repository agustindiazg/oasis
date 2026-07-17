import { and, desc, eq, inArray, like } from "drizzle-orm";
import { AdminShell } from "@/components/admin-shell";
import { Icon } from "@/components/icons";
import { getCurrentContext } from "@/lib/current-context";
import { db } from "@/lib/db";
import { billingPeriods, billingPlans, clients } from "@/lib/db/schema";
import { formatMoney } from "@/lib/money";
import { frequencyLabel, initials } from "@/lib/ui";

type ClientFilters = {
  q?: string;
  status?: string;
  plan?: string;
};

const clientStates = ["Al día", "Pendiente", "Vencido", "Pausado", "Sin plan"] as const;

export default async function Clientes({ searchParams }: { searchParams: Promise<ClientFilters> }) {
  const context = await getCurrentContext();
  const { q, status, plan } = await searchParams;
  const query = q?.trim() ?? "";
  const selectedStatus = clientStates.includes(status as (typeof clientStates)[number]) ? status : "";
  const rows = await db.select({ id: clients.id, name: clients.name, email: clients.email, serviceName: billingPlans.serviceName, amount: billingPlans.amount, currency: billingPlans.currency, frequency: billingPlans.frequency, planStatus: billingPlans.status }).from(clients).leftJoin(billingPlans, and(eq(billingPlans.clientId, clients.id), inArray(billingPlans.status, ["ACTIVE", "PAUSED"]))).where(and(eq(clients.organizationId, context.organizationId), query ? like(clients.name, `%${query}%`) : undefined)).orderBy(desc(clients.createdAt));
  const openPeriods = await db.select({ clientId: billingPeriods.clientId, status: billingPeriods.status }).from(billingPeriods).where(and(eq(billingPeriods.organizationId, context.organizationId), inArray(billingPeriods.status, ["PENDING", "IN_PROCESS", "OVERDUE", "REJECTED"])));
  const statuses = new Map<string, string>();
  openPeriods.forEach((period) => statuses.set(period.clientId, period.status === "OVERDUE" || period.status === "REJECTED" ? "Vencido" : statuses.get(period.clientId) ?? "Pendiente"));
  const planOptions = [...new Set(rows.map((client) => client.serviceName).filter((name): name is string => Boolean(name)))].sort((a, b) => a.localeCompare(b, "es"));
  const filteredRows = rows.filter((client) => {
    const state = statuses.get(client.id) ?? (client.planStatus === "PAUSED" ? "Pausado" : client.planStatus ? "Al día" : "Sin plan");
    return (!plan || client.serviceName === plan) && (!selectedStatus || state === selectedStatus);
  });
  const hasFilters = Boolean(query || plan || selectedStatus);

  return <AdminShell><div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[13px] text-black/45">{hasFilters ? `${filteredRows.length} de ${rows.length}` : rows.length} clientes</p><h2 className="mt-1 text-3xl font-bold tracking-[-.06em]">Clientes</h2></div><a href="/admin/clientes/nuevo" className="rounded-full bg-[#191b1a] px-4 py-2.5 text-center text-[12px] font-bold text-[#f1f0e9]">+ Agregar cliente</a></div>
    <form className="mt-5 flex flex-col gap-2 sm:flex-row" method="get"><input name="q" defaultValue={query} placeholder="Buscar por nombre…" className="min-h-11 flex-1 rounded-full border border-black/10 bg-[#e8e7df] px-4 text-[12px] outline-none focus:border-black" /><div className="relative sm:min-w-44"><select name="status" defaultValue={selectedStatus} className="min-h-11 w-full appearance-none rounded-full border border-black/10 bg-[#e8e7df] px-4 pr-11 text-[12px] outline-none focus:border-black"><option value="">Todos los estados</option>{clientStates.map((state) => <option key={state} value={state}>{state}</option>)}</select><Icon name="chevron" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/75" /></div><div className="relative sm:min-w-52"><select name="plan" defaultValue={plan ?? ""} className="min-h-11 w-full appearance-none rounded-full border border-black/10 bg-[#e8e7df] px-4 pr-11 text-[12px] outline-none focus:border-black"><option value="">Todos los planes</option>{planOptions.map((planName) => <option key={planName} value={planName}>{planName}</option>)}</select><Icon name="chevron" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/75" /></div><button className="rounded-full bg-[#191b1a] px-5 py-3 text-[11px] font-bold text-[#f1f0e9]">Filtrar</button>{hasFilters && <a href="/admin/clientes" className="rounded-full border border-black/10 px-5 py-3 text-center text-[11px] font-bold text-black/55">Limpiar</a>}</form>
    <div className="mt-5 overflow-hidden rounded-2xl border border-black/10 bg-[#e8e7df]"><div className="hidden grid-cols-[1.5fr_1fr_.8fr_.6fr_24px] gap-4 border-b border-black/10 px-5 py-3 text-[9px] uppercase tracking-[.12em] text-black/40 sm:grid"><span>Cliente</span><span>Plan</span><span>Importe</span><span>Estado</span><span /></div>{filteredRows.map((client, index) => { const state = statuses.get(client.id) ?? (client.planStatus === "PAUSED" ? "Pausado" : client.planStatus ? "Al día" : "Sin plan"); return <a href={`/admin/clientes/${client.id}`} key={client.id} className="grid grid-cols-[1fr_24px] items-center gap-4 border-b border-black/10 px-5 py-4 text-[12px] transition last:border-0 hover:bg-[#deddd5] sm:grid-cols-[1.5fr_1fr_.8fr_.6fr_24px]"><div className="flex min-w-0 items-center gap-3"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold ${["bg-[#d7f85b]", "bg-[#ffb77e]", "bg-[#9f8bff]", "bg-[#ff9aaa]"][index % 4]}`}>{initials(client.name)}</span><span className="min-w-0"><span className="block truncate font-semibold">{client.name}</span><span className="block truncate text-[10px] text-black/40 sm:hidden">{client.serviceName ?? "Sin plan"}</span></span></div><span className="hidden truncate text-black/50 sm:block">{client.frequency ? frequencyLabel(client.frequency) : "Sin plan"}</span><span className="hidden font-semibold sm:block">{client.amount != null ? formatMoney(client.amount, client.currency ?? "ARS") : "—"}</span><span className={`hidden text-[10px] font-bold sm:block ${state === "Al día" ? "text-[#5c7415]" : state === "Vencido" ? "text-[#a64252]" : "text-[#a05d1b]"}`}>{state}</span><Icon name="chevron" className="h-4 w-4 text-black/30" /></a>; })}{filteredRows.length === 0 && <p className="px-5 py-14 text-center text-[12px] text-black/45">{hasFilters ? "No hay clientes con estos filtros." : "Todavía no cargaste clientes."}</p>}</div>
  </div></AdminShell>;
}
