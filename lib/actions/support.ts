"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, organizations, waitlistLeads } from "@/lib/db/schema";
import { getCurrentContext } from "@/lib/current-context";
import { ResendNotificationProvider } from "@/lib/notifications/resend";

export async function enterSupportWorkspace(formData: FormData) {
  const context = await getCurrentContext();
  if (context.userRole !== "SUPER_ADMIN") throw new Error("Acceso denegado.");
  const organizationId = String(formData.get("organizationId") ?? "");
  const [organization] = await db.select({ id: organizations.id }).from(organizations).where(eq(organizations.id, organizationId)).limit(1);
  if (!organization) throw new Error("Workspace no encontrado.");
  await db.insert(auditLogs).values({ id: crypto.randomUUID(), organizationId, userId: context.userId, action: "support.workspace_entered", entityType: "organization", entityId: organizationId });
  (await cookies()).set("oasis_support_org", organizationId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 4 });
  redirect("/admin");
}

export async function leaveSupportWorkspace() {
  const context = await getCurrentContext();
  if (context.userRole !== "SUPER_ADMIN") throw new Error("Acceso denegado.");
  (await cookies()).delete("oasis_support_org");
  redirect("/console");
}

export async function sendWaitlistInvite(formData: FormData) {
  const context = await getCurrentContext();
  if (context.userRole !== "SUPER_ADMIN") throw new Error("Acceso denegado.");
  const leadId = String(formData.get("leadId") ?? "");
  const [lead] = await db.select({ id: waitlistLeads.id, email: waitlistLeads.email }).from(waitlistLeads).where(eq(waitlistLeads.id, leadId)).limit(1);
  if (!lead) redirect("/console?invite=missing");

  try {
    const provider = new ResendNotificationProvider();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await provider.sendEmail({ to: lead.email, subject: "Oasis está listo para ordenar tus cobros", html: inviteEmail({ email: lead.email, appUrl }) });
    await db.update(waitlistLeads).set({ status: "CONTACTED" }).where(eq(waitlistLeads.id, lead.id));
    await db.insert(auditLogs).values({ id: crypto.randomUUID(), userId: context.userId, action: "waitlist.invite_sent", entityType: "waitlist_lead", entityId: lead.id, metadata: { email: lead.email } });
    redirect("/console?invite=sent");
  } catch (error) {
    console.error("No se pudo enviar la invitación de acceso anticipado.", error);
    redirect("/console?invite=error");
  }
}

function inviteEmail({ email, appUrl }: { email: string; appUrl: string }) {
  const firstName = email.split("@")[0].split(/[._-]/)[0];
  const safeName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  return `<div style="background:#f1f0e9;padding:40px 20px;font-family:Arial,sans-serif;color:#191b1a;line-height:1.6"><div style="max-width:560px;margin:0 auto;background:#d7f85b;border-radius:28px;padding:40px"><p style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#4e6218">Oasis · acceso anticipado</p><h1 style="font-size:38px;line-height:1.05;letter-spacing:-.06em;margin:28px 0 18px">Cobrar bien se siente bien.</h1><p style="font-size:16px">Hola ${escapeHtml(safeName)},</p><p style="font-size:16px">Te anotaste para conocer Oasis: una forma más clara de ordenar clientes, planes y cobros recurrentes sin perseguir pagos.</p><p style="font-size:16px">Ya podés entrar y empezar a preparar tu negocio.</p><p style="margin:30px 0"><a href="${escapeHtml(appUrl)}/login" style="display:inline-block;background:#191b1a;color:#f1f0e9;padding:14px 22px;border-radius:999px;text-decoration:none;font-weight:bold">Entrar a Oasis →</a></p><p style="font-size:13px;color:#4e6218">Conectá Mercado Pago, cargá tu primer cliente y dejá que Oasis ordene el seguimiento.</p></div><p style="max-width:560px;margin:18px auto 0;font-size:12px;color:#777970">Recibís este mensaje porque te anotaste en la lista de acceso anticipado de Oasis.</p></div>`;
}

function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]!); }
