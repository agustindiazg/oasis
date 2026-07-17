import { eq } from "drizzle-orm";
import { AdminShell } from "@/components/admin-shell";
import { updateSettings } from "@/lib/actions/settings";
import { getCurrentContext } from "@/lib/current-context";
import { db } from "@/lib/db";
import { businessSettings, paymentConnections } from "@/lib/db/schema";

const input = "mt-2 w-full rounded-xl border border-black/10 bg-[#f1f0e9] px-4 py-3 text-[13px] font-normal outline-none transition focus:border-[#191b1a]";

export default async function Preferencias() {
  const context = await getCurrentContext();
  const [[settings], [connection]] = await Promise.all([
    db.select().from(businessSettings).where(eq(businessSettings.organizationId, context.organizationId)).limit(1),
    db.select().from(paymentConnections).where(eq(paymentConnections.organizationId, context.organizationId)).limit(1),
  ]);
  if (!settings) throw new Error("No se encontraron las preferencias del workspace.");
  const connected = connection?.status === "CONNECTED";
  const sandboxAvailable = process.env.NODE_ENV !== "production" && process.env.MERCADO_PAGO_SANDBOX_ENABLED === "true" && Boolean(process.env.MERCADO_PAGO_SANDBOX_ACCESS_TOKEN);
  const isSandbox = connected && connection.environment === "SANDBOX";

  return <AdminShell><div className="mx-auto max-w-[900px] px-5 py-8 sm:px-8"><p className="text-[13px] text-black/45">Configuración de tu workspace</p><h2 className="mt-1 text-3xl font-bold tracking-[-.06em]">Preferencias</h2><form action={updateSettings} className="mt-8 grid gap-4">
    <section className="rounded-2xl border border-black/10 bg-[#e8e7df] p-5 sm:p-7"><p className="mono text-[9px] uppercase tracking-[.15em] text-black/40">Identidad</p><h3 className="mt-4 text-[16px] font-bold">Cómo se ve tu Oasis</h3><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Nombre del negocio" name="businessName" required defaultValue={settings.businessName} /><Field label="Email de contacto" name="contactEmail" type="email" defaultValue={settings.contactEmail ?? ""} /></div></section>
    <section className="rounded-2xl border border-black/10 bg-[#e8e7df] p-5 sm:p-7"><p className="mono text-[9px] uppercase tracking-[.15em] text-black/40">Recordatorios</p><h3 className="mt-4 text-[16px] font-bold">Recordatorios automáticos</h3><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Días antes del vencimiento" name="reminderDaysBefore" type="number" min="0" max="30" defaultValue={String(settings.reminderDaysBefore)} /><label className="flex items-center gap-3 self-end rounded-xl border border-black/10 bg-[#f1f0e9] px-4 py-3 text-[12px] font-semibold"><input name="overdueRemindersEnabled" type="checkbox" defaultChecked={settings.overdueRemindersEnabled} /> Enviar recordatorio si está vencido</label></div></section>
    <button className="w-fit rounded-full bg-[#191b1a] px-5 py-3 text-[11px] font-bold text-[#f1f0e9]">Guardar preferencias</button>
  </form>
  <section className="mt-4 rounded-2xl border border-black/10 bg-[#e8e7df] p-5 sm:p-7"><p className="mono text-[9px] uppercase tracking-[.15em] text-black/40">Pagos</p><h3 className="mt-4 text-[16px] font-bold">Mercado Pago</h3><div className={`mt-5 flex flex-col justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:items-center ${connected ? "border-[#bfd866] bg-[#e1f39a]" : "border-black/10 bg-[#f1f0e9]"}`}><div><div className="flex flex-wrap items-center gap-2"><p className="text-[13px] font-bold">{connected ? "Cuenta conectada" : "Conectá tu cuenta de Mercado Pago"}</p>{connected ? <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[.08em] ${isSandbox ? "bg-[#fff0cf] text-[#704514]" : "bg-[#191b1a] text-white"}`}>{isSandbox ? "Modo de prueba" : "Conectada"}</span> : null}</div><p className="mt-1 text-[11px] text-black/50">{isSandbox ? "Usa dinero y compradores ficticios. Ningún cobro de esta conexión es real." : "Cada negocio autoriza su propia cuenta; Oasis nunca recibe el dinero."}</p></div><div className="flex flex-col gap-2 sm:flex-row">{sandboxAvailable ? <form action="/api/payments/mercadopago/connect/sandbox" method="post"><button className="w-full rounded-full border border-black/20 px-3 py-2 text-center text-[11px] font-bold sm:w-auto">{isSandbox ? "Volver a conectar modo de prueba" : "Usar modo de prueba"}</button></form> : null}<a href="/api/payments/mercadopago/connect" className="rounded-full bg-[#191b1a] px-3 py-2 text-center text-[11px] font-bold text-white">{connected && !isSandbox ? "Volver a conectar Mercado Pago" : "Conectar Mercado Pago"}</a></div></div>{sandboxAvailable ? <p className="mt-3 text-[10px] leading-4 text-black/45">El modo de prueba solo está disponible en desarrollo y utiliza una cuenta ficticia de Mercado Pago.</p> : null}</section>
  </div></AdminShell>;
}

function Field({ label, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
  return <label className={`text-[12px] font-semibold ${className}`}>{label}<input className={input} {...props} /></label>;
}
