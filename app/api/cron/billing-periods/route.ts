import { NextResponse } from "next/server";
import { generateBillingPeriods } from "@/lib/billing/generate";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { businessSettings, paymentConnections } from "@/lib/db/schema";
import { syncPaymentLinks } from "@/lib/payments/service";
import { deliverDueReminders } from "@/lib/notifications/reminders";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const generated = await generateBillingPeriods();
  const connections = await db.select({ organizationId: paymentConnections.organizationId }).from(paymentConnections).where(and(eq(paymentConnections.status, "CONNECTED"), eq(paymentConnections.provider, "MERCADO_PAGO")));
  let links = 0;
  for (const connection of connections) links += (await syncPaymentLinks(connection.organizationId)).created;
  const organizations = await db.select({ organizationId: businessSettings.organizationId }).from(businessSettings);
  const reminders = { scheduled: 0, sent: 0, failed: 0 };
  for (const organization of organizations) {
    const result = await deliverDueReminders(organization.organizationId);
    reminders.scheduled += result.scheduled; reminders.sent += result.sent; reminders.failed += result.failed;
  }
  return NextResponse.json({ ...generated, links, reminders });
}
