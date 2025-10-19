'use client';

import { createContext, useContext } from "react";

type WorkspaceUser = {
  id: string;
  email: string | null;
};

type WorkspaceOrg = {
  id: string;
  name: string;
  slug: string | null;
};

type WorkspaceMembership = {
  org_id: string;
  role: string;
  status: string;
};

export type AppWorkspace = {
  user: WorkspaceUser;
  org: WorkspaceOrg;
  membership: WorkspaceMembership;
};

const AppWorkspaceContext = createContext<AppWorkspace | null>(null);

type AppWorkspaceProviderProps = {
  value: AppWorkspace;
  children: React.ReactNode;
};

export function AppWorkspaceProvider({ value, children }: AppWorkspaceProviderProps) {
  return <AppWorkspaceContext.Provider value={value}>{children}</AppWorkspaceContext.Provider>;
}

export function useAppWorkspace() {
  const context = useContext(AppWorkspaceContext);

  if (!context) {
    throw new Error("useAppWorkspace must be used within an AppWorkspaceProvider");
  }

  return context;
}
