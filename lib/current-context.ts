import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { businessSettings, organizationMembers, organizations, user } from "@/lib/db/schema";

export type CurrentContext = {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: "USER" | "SUPER_ADMIN";
  organizationId: string;
  organizationName: string;
  membershipRole: "OWNER" | "ADMIN" | "MEMBER";
  isDevBypass: boolean;
};

async function findMembership(userId: string) {
  const [membership] = await db.select({
    organizationId: organizationMembers.organizationId,
    organizationName: organizations.name,
    membershipRole: organizationMembers.role,
  }).from(organizationMembers)
    .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
    .where(eq(organizationMembers.userId, userId))
    .limit(1);
  return membership;
}

async function ensureMembership(userId: string, name: string, email: string) {
  const existing = await findMembership(userId);
  if (existing) return existing;

  const organizationId = crypto.randomUUID();
  const normalized = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const organizationName = name ? `${name} Workspace` : "Mi Oasis";
  await db.transaction(async (tx) => {
    await tx.insert(organizations).values({ id: organizationId, name: organizationName, slug: `${normalized || "oasis"}-${userId.slice(0, 8)}`, supportEmail: email });
    await tx.insert(organizationMembers).values({ id: crypto.randomUUID(), organizationId, userId, role: "OWNER" });
    await tx.insert(businessSettings).values({ id: crypto.randomUUID(), organizationId, businessName: organizationName, contactEmail: email, defaultServiceName: "Servicio mensual", defaultCurrency: "ARS", defaultAmount: 0, defaultFrequency: "MONTHLY", defaultDueDay: 10 });
  });
  return (await findMembership(userId))!;
}

async function syncClerkUser(clerkUserId: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;
  const name = clerkUser.fullName ?? ([clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "Usuario Oasis");
  const email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const [byClerkId] = await db.select().from(user).where(eq(user.clerkUserId, clerkUserId)).limit(1);
  if (byClerkId) {
    await db.update(user).set({ name, email, image: clerkUser.imageUrl }).where(eq(user.id, byClerkId.id));
    return { ...byClerkId, name, email, image: clerkUser.imageUrl };
  }

  // Reuse an existing local user with the same email so workspaces and audit logs survive.
  const [byEmail] = await db.select().from(user).where(eq(user.email, email)).limit(1);
  if (byEmail) {
    await db.update(user).set({ clerkUserId, name, image: clerkUser.imageUrl }).where(eq(user.id, byEmail.id));
    return { ...byEmail, clerkUserId, name, image: clerkUser.imageUrl };
  }

  const localUser = { id: crypto.randomUUID(), clerkUserId, name, email, emailVerified: true, image: clerkUser.imageUrl, role: "USER" as const };
  await db.insert(user).values(localUser);
  return localUser;
}

export async function getCurrentContext(): Promise<CurrentContext> {
  if (process.env.NODE_ENV !== "production" && process.env.AUTH_DEV_BYPASS === "true") {
    const membership = await findMembership("dev-user");
    if (!membership) throw new Error("Falta ejecutar `npm run db:seed` para usar AUTH_DEV_BYPASS.");
    const devRole = process.env.AUTH_DEV_ROLE === "SUPER_ADMIN" ? "SUPER_ADMIN" : "USER";
    const supportOrganizationId = (await cookies()).get("oasis_support_org")?.value;
    if (devRole === "SUPER_ADMIN" && supportOrganizationId) {
      const [organization] = await db.select({ id: organizations.id, name: organizations.name }).from(organizations).where(eq(organizations.id, supportOrganizationId)).limit(1);
      if (organization) return { userId: "dev-user", userName: "Ana Torres", userEmail: "ana@estudio.com", userRole: devRole, organizationId: organization.id, organizationName: organization.name, membershipRole: "ADMIN", isDevBypass: true };
    }
    return { userId: "dev-user", userName: "Ana Torres", userEmail: "ana@estudio.com", userRole: devRole, ...membership, isDevBypass: true };
  }

  const clerkSession = await clerkAuth();
  if (clerkSession.userId) {
    const localUser = await syncClerkUser(clerkSession.userId);
    if (!localUser) redirect("/login");
    const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
    if (superAdminEmails.includes(localUser.email.toLowerCase())) await db.update(user).set({ role: "SUPER_ADMIN" }).where(eq(user.id, localUser.id));
    const [dbUser] = await db.select({ role: user.role }).from(user).where(eq(user.id, localUser.id)).limit(1);
    const userRole = dbUser?.role ?? "USER";
    const supportOrganizationId = (await cookies()).get("oasis_support_org")?.value;
    if (userRole === "SUPER_ADMIN" && supportOrganizationId) {
      const [organization] = await db.select({ id: organizations.id, name: organizations.name }).from(organizations).where(eq(organizations.id, supportOrganizationId)).limit(1);
      if (organization) return { userId: localUser.id, userName: localUser.name, userEmail: localUser.email, userRole, organizationId: organization.id, organizationName: organization.name, membershipRole: "ADMIN", isDevBypass: false };
    }
    const membership = await ensureMembership(localUser.id, localUser.name, localUser.email);
    return {
      userId: localUser.id,
      userName: localUser.name,
      userEmail: localUser.email,
      userRole,
      ...membership,
      isDevBypass: false,
    };
  }

  redirect("/login");
}

export async function assertOrganizationAccess(organizationId: string, userId: string) {
  const [membership] = await db.select({ id: organizationMembers.id }).from(organizationMembers).where(and(eq(organizationMembers.organizationId, organizationId), eq(organizationMembers.userId, userId))).limit(1);
  if (!membership) throw new Error("No tenés acceso a esta organización.");
}

export function assertWorkspaceAdmin(context: Pick<CurrentContext, "membershipRole">) {
  if (context.membershipRole !== "OWNER" && context.membershipRole !== "ADMIN") {
    throw new Error("No tenés permisos para modificar este workspace.");
  }
}
