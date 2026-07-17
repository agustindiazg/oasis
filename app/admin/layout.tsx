import { getCurrentContext } from "@/lib/current-context";
import { AdminContextProvider } from "@/components/admin-context";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const context = await getCurrentContext();
  return <AdminContextProvider isSuperAdmin={context.userRole === "SUPER_ADMIN"} workspaceName={context.organizationName}>{children}</AdminContextProvider>;
}
