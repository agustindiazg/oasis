"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { businessSettings } from "@/lib/db/schema";
import { assertWorkspaceAdmin, getCurrentContext } from "@/lib/current-context";
import { parseMoney } from "@/lib/money";

const schema = z.object({
  businessName: z.string().trim().min(2),
  contactEmail: z.string().trim().email().or(z.literal("")),
  defaultServiceName: z.string().trim().min(2),
  defaultCurrency: z.literal("ARS"),
  defaultFrequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"]),
  defaultAmount: z.string().min(1),
  defaultDueDay: z.coerce.number().int().min(0).max(31),
  reminderDaysBefore: z.coerce.number().int().min(0).max(30),
  overdueRemindersEnabled: z.string().optional(),
});

export async function updateSettings(formData: FormData) {
  const context = await getCurrentContext();
  assertWorkspaceAdmin(context);
  const values = schema.parse(Object.fromEntries(formData));
  await db.update(businessSettings).set({
    businessName: values.businessName,
    contactEmail: values.contactEmail || null,
    defaultServiceName: values.defaultServiceName,
    defaultCurrency: values.defaultCurrency,
    defaultFrequency: values.defaultFrequency,
    defaultAmount: parseMoney(values.defaultAmount),
    defaultDueDay: values.defaultDueDay,
    reminderDaysBefore: values.reminderDaysBefore,
    overdueRemindersEnabled: values.overdueRemindersEnabled === "on",
  }).where(eq(businessSettings.organizationId, context.organizationId));
  revalidatePath("/admin/preferencias");
  revalidatePath("/admin/clientes/nuevo");
}
