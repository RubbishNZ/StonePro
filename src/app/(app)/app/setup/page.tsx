import type { Metadata } from "next";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Workspace setup",
};

export default async function SetupPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileTenantId: string | null = null;
  let profileRole: string | null = null;
  let tenantName: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id, role, tenants(name)")
      .eq("user_id", user.id)
      .maybeSingle();

    profileTenantId = profile?.tenant_id ?? null;
    profileRole = profile?.role ?? null;
    tenantName = profile?.tenants?.name ?? null;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-slate-700 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Finish workspace setup</h1>
      <p className="text-sm text-slate-600">
        You don’t have an active StoneOpsPro workspace yet. Create a tenant and
        link your profile to it in Supabase.
      </p>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
        <li>
          Insert a row into <code>tenants</code> (e.g., your company name).
        </li>
        <li>
          Insert a row into <code>profiles</code> with your <code>user_id</code>,
          the <code>tenant_id</code> from step 1, and a <code>role</code> of
          <code>'admin'</code> or <code>'member'</code>.
        </li>
      </ol>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Current Supabase state
        </h2>
        <dl className="mt-4 grid gap-3 text-sm text-slate-600">
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Auth user ID
            </dt>
            <dd className="font-mono text-xs text-slate-500">{user?.id ?? "not signed in"}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              profiles.tenant_id
            </dt>
            <dd className="font-mono text-xs text-slate-600">
              {profileTenantId ?? "null"}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              profiles.role
            </dt>
            <dd className="font-mono text-xs text-slate-600">{profileRole ?? "null"}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              tenant name
            </dt>
            <dd className="font-mono text-xs text-slate-600">{tenantName ?? "null"}</dd>
          </div>
        </dl>
      </div>

      <p className="text-xs text-slate-500">
        Once your profile is linked to a tenant, refresh the page to continue.
      </p>
    </div>
  );
}