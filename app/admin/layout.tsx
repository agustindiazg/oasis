import { getCurrentContext } from "@/lib/current-context";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await getCurrentContext();
  return children;
}
