"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, organizations } from "@/lib/db/schema";
import { getCurrentContext } from "@/lib/current-context";

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
  redirect("/support");
}
