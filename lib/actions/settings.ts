"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { businessSettings } from "@/lib/db/schema";
import { assertWorkspaceAdmin, getCurrentContext } from "@/lib/current-context";

const schema = z.object({
  businessName: z.string().trim().min(2),
  contactEmail: z.string().trim().email().or(z.literal("")),
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
    reminderDaysBefore: values.reminderDaysBefore,
    overdueRemindersEnabled: values.overdueRemindersEnabled === "on",
  }).where(eq(businessSettings.organizationId, context.organizationId));
  revalidatePath("/admin/preferencias");
  revalidatePath("/admin/clientes/nuevo");
}
