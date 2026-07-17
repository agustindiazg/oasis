import { notFound } from "next/navigation";
import { enterSupportWorkspace, leaveSupportWorkspace } from "@/lib/actions/support";
import { getCurrentContext } from "@/lib/current-context";
import { db } from "@/lib/db";
import { billingPeriods, clients, organizations } from "@/lib/db/schema";

export default async function Support() {
  const context = await getCurrentContext();
  if (context.userRole !== "SUPER_ADMIN") notFound();
  const workspaces = await db.select().from(organizations);
  const allClients = await db.select({ organizationId: clients.organizationId }).from(clients);
  const openPeriods = await db.select({ organizationId: billingPeriods.organizationId, status: billingPeriods.status }).from(billingPeriods);
  return <main className="min-h-screen bg-[#191b1a] px-5 py-10 text-[#f1f0e9]"><div className="mx-auto max-w-5xl"><div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-end"><div><p className="mono text-[9px] uppercase tracking-[.16em] text-white/40">Oasis interno</p><h1 className="mt-3 text-4xl font-bold tracking-[-.07em]">Soporte de workspaces</h1><p className="mt-2 text-[13px] text-white/45">Ingresá al panel de un cliente para ayudarlo.</p></div><form action={leaveSupportWorkspace}><button className="rounded-full border border-white/15 px-4 py-2.5 text-[11px] font-bold">Salir del modo soporte</button></form></div><div className="mt-8 grid gap-3">{workspaces.map((workspace) => { const count = allClients.filter((client) => client.organizationId === workspace.id).length; const open = openPeriods.filter((period) => period.organizationId === workspace.id && ["PENDING", "OVERDUE", "REJECTED"].includes(period.status)).length; return <div key={workspace.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center"><div><p className="text-[15px] font-bold">{workspace.name}</p><p className="mt-1 text-[11px] text-white/45">{count} clientes · {open} cobros abiertos · {workspace.supportEmail ?? "sin email"}</p></div><form action={enterSupportWorkspace}><input type="hidden" name="organizationId" value={workspace.id} /><button className="rounded-full bg-[#d7f85b] px-4 py-2.5 text-[11px] font-bold text-[#191b1a]">Abrir panel →</button></form></div>; })}</div></div></main>;
}
