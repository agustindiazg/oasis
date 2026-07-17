import { and, eq } from "drizzle-orm";
import { format } from "date-fns";
import { AdminShell } from "@/components/admin-shell";
import { Icon } from "@/components/icons";
import { ClientPlanFields } from "@/components/client-plan-fields";
import { createClient } from "@/lib/actions/clients";
import { getCurrentContext } from "@/lib/current-context";
import { db } from "@/lib/db";
import { businessSettings, servicePlans } from "@/lib/db/schema";

const input = "mt-2 w-full rounded-xl border border-black/10 bg-[#f1f0e9] px-4 py-3 text-[13px] outline-none transition placeholder:text-black/30 focus:border-[#191b1a]";

export default async function NuevoCliente() {
  const context = await getCurrentContext();
  const [[settings], catalog] = await Promise.all([
    db.select().from(businessSettings).where(eq(businessSettings.organizationId, context.organizationId)).limit(1),
    db.select().from(servicePlans).where(and(eq(servicePlans.organizationId, context.organizationId), eq(servicePlans.status, "ACTIVE"))).orderBy(servicePlans.name),
  ]);
  return <AdminShell><div className="mx-auto max-w-[1000px] px-5 py-8 sm:px-8"><a href="/admin/clientes" className="text-[12px] font-semibold text-black/50 hover:text-black">← Volver a clientes</a><div className="mt-8 border-b border-black/10 pb-8"><p className="mono text-[9px] uppercase tracking-[.16em] text-black/40">Nuevo registro</p><h2 className="mt-3 text-4xl font-bold tracking-[-.07em]">Agregar cliente</h2><p className="mt-2 max-w-[520px] text-[13px] leading-6 text-black/50">Oasis generará los cobros automáticamente según el plan.</p></div>
    <form action={createClient} className="mt-8 grid gap-4 lg:grid-cols-[1.25fr_.75fr]"><div className="space-y-4"><section className="rounded-2xl border border-black/10 bg-[#e8e7df] p-5 sm:p-7"><p className="mono text-[9px] uppercase tracking-[.15em] text-black/40">01 · Cliente</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Nombre y apellido" name="name" required placeholder="Ej. Martina López" /><Field label="Email" name="email" type="email" placeholder="martina@email.com" /><Field label="Teléfono" name="phone" placeholder="+54 9 11 ..." /><Field label="Fecha de alta" name="startedAt" type="date" required defaultValue={format(new Date(), "yyyy-MM-dd")} /><TextareaField label="Descripción / notas" name="notes" className="sm:col-span-2" placeholder="Contexto útil sobre el cliente, acuerdos o preferencias" /></div></section>
      <section className="rounded-2xl border border-black/10 bg-[#e8e7df] p-5 sm:p-7"><p className="mono text-[9px] uppercase tracking-[.15em] text-black/40">02 · Plan de cobro</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><ClientPlanFields catalog={catalog} defaultName={settings?.defaultServiceName ?? "Servicio mensual"} defaultAmount={String((settings?.defaultAmount ?? 0) / 100)} defaultFrequency={settings?.defaultFrequency ?? "MONTHLY"} defaultDueDay={String(settings?.defaultDueDay ?? 10)} /></div></section>
      <div className="flex justify-end gap-2"><a href="/admin/clientes" className="rounded-full border border-black/10 px-5 py-3 text-[12px] font-semibold">Cancelar</a><button className="rounded-full bg-[#191b1a] px-5 py-3 text-[12px] font-bold text-[#f1f0e9]">Guardar y generar cobros <Icon name="arrow" className="ml-2 inline h-3.5 w-3.5" /></button></div></div>
      <aside className="h-fit rounded-2xl bg-[#191b1a] p-6 text-[#f1f0e9] lg:sticky lg:top-6"><p className="mono text-[9px] uppercase tracking-[.15em] text-white/45">Qué sucede al guardar</p><ol className="mt-7 space-y-5 text-[12px] leading-5 text-white/60"><li><b className="text-white">01.</b> Se crea la ficha del cliente.</li><li><b className="text-white">02.</b> Oasis calcula los próximos períodos.</li><li><b className="text-white">03.</b> Cuando el cliente pague, el estado se actualizará automáticamente.</li></ol><div className="mt-8 rounded-xl bg-white/5 p-4 text-[11px] leading-5 text-white/55">No existe una acción manual para marcar como pagado: Oasis lo actualiza automáticamente cuando Mercado Pago confirma el pago.</div></aside>
    </form>
  </div></AdminShell>;
}

function Field({ label, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
  return <label className={`text-[12px] font-semibold ${className}`}>{label}<input className={input} {...props} /></label>;
}

function TextareaField({ label, className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; className?: string }) {
  return <label className={`text-[12px] font-semibold ${className}`}>{label}<textarea className={`${input} min-h-24 resize-y`} {...props} /></label>;
}
