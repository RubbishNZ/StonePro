import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import {
  resolveActiveOrg,
  type ActiveOrgResult,
} from "@/lib/server/organizations";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  let activeOrg: ActiveOrgResult | null = null;

  try {
    activeOrg = await resolveActiveOrg(supabase, user.id);
  } catch (error) {
    console.warn("User authenticated without active org", error);
  }

  if (!activeOrg) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center p-6">
          <div className="w-full">{children}</div>
        </main>
      </div>
    );
  }

  const { org, membership } = activeOrg;

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      <AppSidebar orgName={org.name} />
      <div className="flex flex-1 flex-col">
        <AppTopbar email={user.email} orgName={org.name} role={membership.role} />
        <main className="flex-1 overflow-y-auto bg-slate-900/60 p-4 sm:p-6">
          <div className="w-full max-w-none space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}