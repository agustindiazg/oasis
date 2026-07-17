import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

const id = (name = "id") => varchar(name, { length: 36 });
const createdAt = () => timestamp("created_at").defaultNow().notNull();
const updatedAt = () => timestamp("updated_at").defaultNow().onUpdateNow().notNull();

export const user = mysqlTable("user", {
  id: id().primaryKey(),
  clerkUserId: varchar("clerk_user_id", { length: 64 }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: mysqlEnum("role", ["USER", "SUPER_ADMIN"]).default("USER").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [uniqueIndex("user_email_unique").on(table.email), uniqueIndex("user_clerk_user_id_unique").on(table.clerkUserId)]);

export const session = mysqlTable("session", {
  id: id().primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  ipAddress: varchar("ip_address", { length: 255 }),
  userAgent: text("user_agent"),
  userId: id("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
}, (table) => [uniqueIndex("session_token_unique").on(table.token), index("session_user_idx").on(table.userId)]);

export const account = mysqlTable("account", {
  id: id().primaryKey(),
  accountId: varchar("account_id", { length: 255 }).notNull(),
  providerId: varchar("provider_id", { length: 255 }).notNull(),
  userId: id("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("account_user_idx").on(table.userId), uniqueIndex("account_provider_unique").on(table.providerId, table.accountId)]);

export const verification = mysqlTable("verification", {
  id: id().primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("verification_identifier_idx").on(table.identifier)]);

export const waitlistLeads = mysqlTable("waitlist_leads", {
  id: id().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  source: varchar("source", { length: 80 }).default("landing").notNull(),
  status: mysqlEnum("status", ["NEW", "CONTACTED", "CONVERTED", "UNSUBSCRIBED"]).default("NEW").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [uniqueIndex("waitlist_lead_email_unique").on(table.email), index("waitlist_lead_status_idx").on(table.status)]);

export const organizations = mysqlTable("organizations", {
  id: id().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull(),
  supportEmail: varchar("support_email", { length: 255 }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [uniqueIndex("organization_slug_unique").on(table.slug)]);

export const organizationMembers = mysqlTable("organization_members", {
  id: id().primaryKey(),
  organizationId: id("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: id("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["OWNER", "ADMIN", "MEMBER"]).default("MEMBER").notNull(),
  createdAt: createdAt(),
}, (table) => [uniqueIndex("organization_member_unique").on(table.organizationId, table.userId), index("organization_member_user_idx").on(table.userId)]);

export const businessSettings = mysqlTable("business_settings", {
  id: id().primaryKey(),
  organizationId: id("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  contactEmail: varchar("contact_email", { length: 255 }),
  defaultServiceName: varchar("default_service_name", { length: 255 }),
  defaultCurrency: varchar("default_currency", { length: 3 }).default("ARS").notNull(),
  defaultAmount: bigint("default_amount", { mode: "number", unsigned: true }).default(0).notNull(),
  defaultFrequency: mysqlEnum("default_frequency", ["WEEKLY", "BIWEEKLY", "MONTHLY", "CUSTOM"]).default("MONTHLY").notNull(),
  defaultDueDay: int("default_due_day").default(10).notNull(),
  reminderDaysBefore: int("reminder_days_before").default(3).notNull(),
  overdueRemindersEnabled: boolean("overdue_reminders_enabled").default(true).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [uniqueIndex("business_settings_org_unique").on(table.organizationId)]);

export const clients = mysqlTable("clients", {
  id: id().primaryKey(),
  organizationId: id("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 80 }),
  notes: text("notes"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  status: mysqlEnum("status", ["ACTIVE", "ARCHIVED"]).default("ACTIVE").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("client_organization_idx").on(table.organizationId), index("client_name_idx").on(table.name)]);

export const billingPlans = mysqlTable("billing_plans", {
  id: id().primaryKey(),
  organizationId: id("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  clientId: id("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  serviceName: varchar("service_name", { length: 255 }).notNull(),
  amount: bigint("amount", { mode: "number", unsigned: true }).notNull(),
  currency: varchar("currency", { length: 3 }).default("ARS").notNull(),
  frequency: mysqlEnum("frequency", ["WEEKLY", "BIWEEKLY", "MONTHLY", "CUSTOM"]).notNull(),
  intervalDays: int("interval_days"),
  dueDay: int("due_day"),
  status: mysqlEnum("status", ["ACTIVE", "PAUSED", "CANCELED"]).default("ACTIVE").notNull(),
  nextPeriodAt: timestamp("next_period_at").notNull(),
  pausedAt: timestamp("paused_at"),
  canceledAt: timestamp("canceled_at"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("billing_plan_org_idx").on(table.organizationId), index("billing_plan_client_idx").on(table.clientId), index("billing_plan_next_idx").on(table.status, table.nextPeriodAt)]);

export const billingPeriods = mysqlTable("billing_periods", {
  id: id().primaryKey(),
  organizationId: id("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  clientId: id("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  planId: id("plan_id").notNull().references(() => billingPlans.id, { onDelete: "cascade" }),
  periodKey: varchar("period_key", { length: 40 }).notNull(),
  dueAt: timestamp("due_at").notNull(),
  amount: bigint("amount", { mode: "number", unsigned: true }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  status: mysqlEnum("status", ["PENDING", "IN_PROCESS", "APPROVED", "REJECTED", "OVERDUE", "CANCELED", "REFUNDED", "CHARGED_BACK"]).default("PENDING").notNull(),
  paymentLink: text("payment_link"),
  paidAt: timestamp("paid_at"),
  canceledAt: timestamp("canceled_at"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [uniqueIndex("billing_period_plan_key_unique").on(table.planId, table.periodKey), index("billing_period_org_status_idx").on(table.organizationId, table.status), index("billing_period_client_idx").on(table.clientId), index("billing_period_due_idx").on(table.dueAt)]);

export const paymentConnections = mysqlTable("payment_connections", {
  id: id().primaryKey(),
  organizationId: id("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  provider: mysqlEnum("provider", ["MERCADO_PAGO", "STRIPE", "GALIO"]).notNull(),
  environment: mysqlEnum("environment", ["PRODUCTION", "SANDBOX"]).default("PRODUCTION").notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }),
  encryptedAccessToken: text("encrypted_access_token"),
  encryptedRefreshToken: text("encrypted_refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  status: mysqlEnum("status", ["CONNECTED", "DISCONNECTED", "ERROR"]).default("DISCONNECTED").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [uniqueIndex("payment_connection_org_provider_unique").on(table.organizationId, table.provider)]);

export const payments = mysqlTable("payments", {
  id: id().primaryKey(),
  organizationId: id("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  billingPeriodId: id("billing_period_id").notNull().references(() => billingPeriods.id, { onDelete: "cascade" }),
  provider: mysqlEnum("provider", ["MERCADO_PAGO", "STRIPE", "GALIO"]).notNull(),
  providerPaymentId: varchar("provider_payment_id", { length: 255 }).notNull(),
  externalReference: varchar("external_reference", { length: 255 }).notNull(),
  amount: bigint("amount", { mode: "number", unsigned: true }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  status: varchar("status", { length: 60 }).notNull(),
  rawPayload: json("raw_payload"),
  paidAt: timestamp("paid_at"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [uniqueIndex("payment_provider_id_unique").on(table.provider, table.providerPaymentId), index("payment_period_idx").on(table.billingPeriodId)]);

export const webhookEvents = mysqlTable("webhook_events", {
  id: id().primaryKey(),
  provider: mysqlEnum("provider", ["MERCADO_PAGO", "STRIPE", "GALIO"]).notNull(),
  providerEventId: varchar("provider_event_id", { length: 255 }).notNull(),
  payload: json("payload").notNull(),
  status: mysqlEnum("status", ["RECEIVED", "PROCESSED", "FAILED"]).default("RECEIVED").notNull(),
  error: text("error"),
  processedAt: timestamp("processed_at"),
  createdAt: createdAt(),
}, (table) => [uniqueIndex("webhook_provider_event_unique").on(table.provider, table.providerEventId)]);

export const reminderDeliveries = mysqlTable("reminder_deliveries", {
  id: id().primaryKey(),
  organizationId: id("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  billingPeriodId: id("billing_period_id").notNull().references(() => billingPeriods.id, { onDelete: "cascade" }),
  deliveryKey: varchar("delivery_key", { length: 120 }).notNull(),
  channel: mysqlEnum("channel", ["EMAIL"]).default("EMAIL").notNull(),
  kind: mysqlEnum("kind", ["BEFORE_DUE", "OVERDUE"]).notNull(),
  recipient: varchar("recipient", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["SCHEDULED", "SENT", "FAILED"]).default("SCHEDULED").notNull(),
  providerMessageId: varchar("provider_message_id", { length: 255 }),
  error: text("error"),
  sentAt: timestamp("sent_at"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [uniqueIndex("reminder_delivery_key_unique").on(table.deliveryKey), index("reminder_org_status_idx").on(table.organizationId, table.status)]);

export const auditLogs = mysqlTable("audit_logs", {
  id: id().primaryKey(),
  organizationId: id("organization_id").references(() => organizations.id, { onDelete: "set null" }),
  userId: id("user_id").references(() => user.id, { onDelete: "set null" }),
  action: varchar("action", { length: 120 }).notNull(),
  entityType: varchar("entity_type", { length: 80 }),
  entityId: varchar("entity_id", { length: 36 }),
  metadata: json("metadata"),
  createdAt: createdAt(),
}, (table) => [index("audit_org_created_idx").on(table.organizationId, table.createdAt)]);

export const userRelations = relations(user, ({ many }) => ({ sessions: many(session), accounts: many(account), memberships: many(organizationMembers) }));
export const sessionRelations = relations(session, ({ one }) => ({ user: one(user, { fields: [session.userId], references: [user.id] }) }));
export const accountRelations = relations(account, ({ one }) => ({ user: one(user, { fields: [account.userId], references: [user.id] }) }));
export const organizationsRelations = relations(organizations, ({ many, one }) => ({ members: many(organizationMembers), clients: many(clients), settings: one(businessSettings) }));
export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({ organization: one(organizations, { fields: [organizationMembers.organizationId], references: [organizations.id] }), user: one(user, { fields: [organizationMembers.userId], references: [user.id] }) }));
export const clientsRelations = relations(clients, ({ one, many }) => ({ organization: one(organizations, { fields: [clients.organizationId], references: [organizations.id] }), plans: many(billingPlans), periods: many(billingPeriods) }));
export const billingPlansRelations = relations(billingPlans, ({ one, many }) => ({ client: one(clients, { fields: [billingPlans.clientId], references: [clients.id] }), periods: many(billingPeriods) }));
export const billingPeriodsRelations = relations(billingPeriods, ({ one, many }) => ({ client: one(clients, { fields: [billingPeriods.clientId], references: [clients.id] }), plan: one(billingPlans, { fields: [billingPeriods.planId], references: [billingPlans.id] }), payments: many(payments) }));

export const schema = {
  user, session, account, verification, waitlistLeads,
  organizations, organizationMembers, businessSettings,
  clients, billingPlans, billingPeriods,
  paymentConnections, payments, webhookEvents, reminderDeliveries, auditLogs,
  userRelations, sessionRelations, accountRelations,
  organizationsRelations, organizationMembersRelations,
  clientsRelations, billingPlansRelations, billingPeriodsRelations,
};
