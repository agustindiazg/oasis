import { NextResponse } from "next/server";
import { getCurrentContext } from "@/lib/current-context";

export async function GET() {
  const context = await getCurrentContext();
  return NextResponse.json({ isSuperAdmin: context.userRole === "SUPER_ADMIN", organizationName: context.organizationName }, { headers: { "Cache-Control": "no-store" } });
}
