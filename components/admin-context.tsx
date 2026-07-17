"use client";

import { createContext, useContext } from "react";

type AdminContextValue = {
  isSuperAdmin: boolean;
  workspaceName: string;
};

const AdminContext = createContext<AdminContextValue>({ isSuperAdmin: false, workspaceName: "" });

export function AdminContextProvider({ children, isSuperAdmin, workspaceName }: AdminContextValue & { children: React.ReactNode }) {
  return <AdminContext.Provider value={{ isSuperAdmin, workspaceName }}>{children}</AdminContext.Provider>;
}

export function useAdminContext() {
  return useContext(AdminContext);
}
