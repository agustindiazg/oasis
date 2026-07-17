import { config } from "dotenv";
import { addDays, setDate, startOfMonth, subMonths } from "date-fns";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

const organizationId = "dev-organization";
const seeds = [
  { id: "client-martina", name: "Martina López", email: "martina@ejemplo.com", phone: "+54 9 11 5555 0101", service: "Contabilidad mensual", amount: 6500000, dueDay: 15, state: "APPROVED" as const },
  { id: "client-santiago", name: "Santiago Ruiz", email: "santiago@ejemplo.com", phone: "+54 9 11 5555 0102", service: "Entrenamiento personal", amount: 4800000, dueDay: 10, state: "PENDING" as const },
  { id: "client-lucia", name: "Lucía Méndez", email: "lucia@ejemplo.com", phone: "+54 9 11 5555 0103", service: "Consultoría", amount: 8500000, dueDay: 8, state: "APPROVED" as const },
  { id: "client-tomas", name: "Tomás Acosta", email: "tomas@ejemplo.com", phone: "+54 9 11 5555 0104", service: "Clases de inglés", amount: 5040000, dueDay: 5, state: "OVERDUE" as const },
];

async function main() {
const { db, pool } = await import("../lib/db");
const { billingPeriods, billingPlans, businessSettings, clients, organizationMembers, organizations, user } = await import("../lib/db/schema");

await db.insert(user).values({ id: "dev-user", name: "Ana Torres", email: "ana@estudio.com", emailVerified: true }).onDuplicateKeyUpdate({ set: { name: "Ana Torres" } });
await db.insert(organizations).values({ id: organizationId, name: "Estudio Ana Torres", slug: "estudio-ana-torres", supportEmail: "ana@estudio.com" }).onDuplicateKeyUpdate({ set: { name: "Estudio Ana Torres" } });
await db.insert(organizationMembers).values({ id: "dev-membership", organizationId, userId: "dev-user", role: "OWNER" }).onDuplicateKeyUpdate({ set: { role: "OWNER" } });
await db.insert(businessSettings).values({ id: "dev-settings", organizationId, businessName: "Estudio Ana Torres", contactEmail: "ana@estudio.com", defaultServiceName: "Contabilidad mensual", defaultCurrency: "ARS", defaultAmount: 6500000, defaultFrequency: "MONTHLY", defaultDueDay: 10, reminderDaysBefore: 3, overdueRemindersEnabled: true }).onDuplicateKeyUpdate({ set: { businessName: "Estudio Ana Torres" } });

const thisMonth = startOfMonth(new Date());
for (const item of seeds) {
  const planId = `plan-${item.id}`;
  const dueAt = setDate(thisMonth, item.dueDay);
  const nextPeriodAt = setDate(addDays(thisMonth, 40), item.dueDay);
  await db.insert(clients).values({ id: item.id, organizationId, name: item.name, email: item.email, phone: item.phone }).onDuplicateKeyUpdate({ set: { name: item.name } });
  await db.insert(billingPlans).values({ id: planId, organizationId, clientId: item.id, serviceName: item.service, amount: item.amount, currency: "ARS", frequency: "MONTHLY", dueDay: item.dueDay, status: "ACTIVE", nextPeriodAt }).onDuplicateKeyUpdate({ set: { serviceName: item.service } });
  await db.insert(billingPeriods).values({ id: `period-${item.id}-current`, organizationId, clientId: item.id, planId, periodKey: `seed-${item.id}-current`, dueAt, amount: item.amount, currency: "ARS", status: item.state, paidAt: item.state === "APPROVED" ? dueAt : null }).onDuplicateKeyUpdate({ set: { status: item.state, paidAt: item.state === "APPROVED" ? dueAt : null } });
  const previousDue = setDate(subMonths(thisMonth, 1), item.dueDay);
  await db.insert(billingPeriods).values({ id: `period-${item.id}-previous`, organizationId, clientId: item.id, planId, periodKey: `seed-${item.id}-previous`, dueAt: previousDue, amount: item.amount, currency: "ARS", status: "APPROVED", paidAt: previousDue }).onDuplicateKeyUpdate({ set: { status: "APPROVED" } });
}

const [count] = await db.select({ id: clients.id }).from(clients).where(eq(clients.organizationId, organizationId)).limit(1);
console.log(count ? "Datos demo disponibles." : "No se pudieron crear los datos demo.");
await pool.end();
}

main().catch((error) => { console.error(error); process.exit(1); });
