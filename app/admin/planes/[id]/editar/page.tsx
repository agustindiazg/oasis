import { and, eq } from "drizzle-orm";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { updateClientPlan } from "@/lib/actions/clients";
import { getCurrentContext } from "@/lib/current-context";
import { db } from "@/lib/db";
import { billingPlans, clients } from "@/lib/db/schema";

const input = "mt-2 w-full rounded-xl border border-black/10 bg-[#f1f0e9] px-4 py-3 text-[13px] outline-none focus:border-[#191b1a]";

export default async function EditarPlan({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getCurrentContext();
  const [record] = await db.select({ plan: billingPlans, client: clients }).from(billingPlans).innerJoin(clients, eq(clients.id, billingPlans.clientId)).where(and(eq(billingPlans.id, id), eq(billingPlans.organizationId, context.organizationId))).limit(1);
  if (!record) notFound();
  const { client, plan } = record;
  return <AdminShell><div className="mx-auto max-w-[850px] px-5 py-8 sm:px-8"><a href={`/admin/clientes/${client.id}`} className="text-[12px] font-semibold text-black/50">← Volver al cliente</a><div className="mt-8"><p className="mono text-[9px] uppercase tracking-[.16em] text-black/40">Edición</p><h2 className="mt-3 text-4xl font-bold tracking-[-.07em]">{client.name}</h2><p className="mt-2 text-[13px] text-black/45">Los cambios de importe se aplican a cobros futuros; el historial queda intacto.</p></div><form action={updateClientPlan} className="mt-8 space-y-4"><input type="hidden" name="clientId" value={client.id} /><input type="hidden" name="planId" value={plan.id} /><section className="rounded-2xl border border-black/10 bg-[#e8e7df] p-5 sm:p-7"><h3 className="text-[15px] font-bold">Datos del cliente</h3><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Nombre" name="name" required defaultValue={client.name} /><Field label="Email" name="email" type="email" defaultValue={client.email ?? ""} /><Field label="Teléfono" name="phone" defaultValue={client.phone ?? ""} /><Field label="Fecha de alta" name="startedAt" type="date" required defaultValue={format(client.startedAt, "yyyy-MM-dd")} /><TextareaField label="Descripción / notas" name="notes" className="sm:col-span-2" defaultValue={client.notes ?? ""} placeholder="Contexto útil sobre el cliente, acuerdos o preferencias" /></div></section><section className="rounded-2xl border border-black/10 bg-[#e8e7df] p-5 sm:p-7"><h3 className="text-[15px] font-bold">Plan recurrente</h3><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Servicio" name="serviceName" required className="sm:col-span-2" defaultValue={plan.serviceName} /><Field label="Importe" name="amount" inputMode="decimal" required defaultValue={String(plan.amount / 100)} /><label className="text-[12px] font-semibold">Moneda<select className={input} name="currency" defaultValue={plan.currency}><option value="ARS">ARS</option><option value="USD">USD</option></select></label><label className="text-[12px] font-semibold">Frecuencia<select className={input} name="frequency" defaultValue={plan.frequency}><option value="WEEKLY">Semanal</option><option value="BIWEEKLY">Cada 15 días</option><option value="MONTHLY">Mensual</option><option value="CUSTOM">Personalizada</option></select></label><Field label="Día de vencimiento" name="dueDay" type="number" min="0" max="31" defaultValue={String(plan.dueDay ?? 10)} /><Field label="Intervalo personalizado" name="intervalDays" type="number" min="1" max="365" defaultValue={String(plan.intervalDays ?? 30)} /></div></section><div className="flex justify-end gap-2"><a href={`/admin/clientes/${client.id}`} className="rounded-full border border-black/10 px-5 py-3 text-[12px] font-semibold">Cancelar</a><button className="rounded-full bg-[#191b1a] px-5 py-3 text-[12px] font-bold text-white">Guardar cambios</button></div></form></div></AdminShell>;
}

function Field({ label, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) { return <label className={`text-[12px] font-semibold ${className}`}>{label}<input className={input} {...props} /></label>; }

function TextareaField({ label, className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; className?: string }) { return <label className={`text-[12px] font-semibold ${className}`}>{label}<textarea className={`${input} min-h-24 resize-y`} {...props} /></label>; }
