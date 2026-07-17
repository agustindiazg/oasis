import type { NotificationProvider } from "@/lib/notifications/types";

export class ResendNotificationProvider implements NotificationProvider {
  async sendEmail(input: { to: string; subject: string; html: string }) {
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) throw new Error("Resend no está configurado.");
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL, ...input }), cache: "no-store" });
    if (!response.ok) throw new Error(`No se pudo enviar el recordatorio (${response.status}).`);
    return response.json() as Promise<{ id: string }>;
  }
}
