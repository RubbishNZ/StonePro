import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { AppWorkspaceProvider } from "@/components/layout/app-shell-context";
import {
  resolveActiveOrg,
  type ActiveOrgResult,
} from "@/lib/server/organizations";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AppLayoutProps = {
  children: React.ReactNode;
};

function MissingEnvMessage({ error }: { error: unknown }) {
  const message =
    error instanceof Error ? error.message : "Supabase environment variables are missing.";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-white">Supabase is not configured</h1>
          <p className="text-sm text-slate-300">
            {message} Set <code className="mx-1 rounded bg-slate-900 px-2 py-1">NEXT_PUBLIC_SUPABASE_URL</code> and
            <code className="mx-1 rounded bg-slate-900 px-2 py-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in
            <code className="mx-1 rounded bg-slate-900 px-2 py-1">.env.local</code>, then restart the dev server.
          </p>
          <a
            href="/app/setup"
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            View setup guide
          </a>
        </div>
      </main>
    </div>
  );
}

function MissingWorkspace({
  children,
  userEmail,
  error,
}: {
  children: React.ReactNode;
  userEmail: string | null;
  error?: unknown;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-8 p-8">
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold text-white">Workspace setup required</h1>
          <p className="text-sm text-slate-300">
            We couldn’t find an active workspace for
            <span className="mx-1 rounded-full bg-slate-900 px-2 py-1 font-mono text-xs text-slate-100">
              {userEmail ?? "this account"}
            </span>
            . Create a tenant and link your profile in Supabase, then refresh.
          </p>
          {error ? (
            <pre className="overflow-auto rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-left text-xs text-amber-100">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="/app/setup"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              Go to setup checklist
            </a>
            <a
              href="https://app.supabase.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
            >
              Open Supabase project
            </a>
          </div>
        </section>
        <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
          {children}
        </section>
      </main>
    </div>
  );
}

export default async function AppLayout({ children }: AppLayoutProps) {
  let supabase;

  try {
    supabase = createSupabaseServerClient();
  } catch (error) {
    console.error("[app-layout] Supabase misconfiguration", error);
    return <MissingEnvMessage error={error} />;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  let activeOrg: ActiveOrgResult | null = null;
  let activeOrgError: unknown = null;

  try {
    activeOrg = await resolveActiveOrg(supabase, user.id);
  } catch (error) {
    activeOrgError = error;
    console.warn("User authenticated without active org", error);
  }

  if (!activeOrg) {
    return <MissingWorkspace userEmail={user.email ?? null} error={activeOrgError}>{children}</MissingWorkspace>;
  }

  const workspace = {
    user: { id: user.id, email: user.email ?? null },
    org: activeOrg.org,
    membership: activeOrg.membership,
  };

  return (
    <AppWorkspaceProvider value={workspace}>
      <div className="flex min-h-screen bg-slate-100 text-slate-900">
        <AppSidebar orgName={activeOrg.org.name} />
        <div className="flex flex-1 flex-col bg-slate-50">
          <AppTopbar email={user.email} orgName={activeOrg.org.name} role={activeOrg.membership.role} />
          <main className="flex-1 overflow-y-auto bg-white p-4 sm:p-6">
            <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </AppWorkspaceProvider>
  );
}