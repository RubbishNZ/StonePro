import type { Metadata } from "next";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Workspace setup",
};

type MembershipRow = {
  org_id: string;
  role: string;
  status: string;
};

export default async function SetupPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileDefaultOrg: string | null = null;
  let memberships: MembershipRow[] = [];

  if (user) {
    const [{ data: profile }, { data: memberRows }] = await Promise.all([
      supabase
        .from("profiles")
        .select("default_org_id")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("org_members")
        .select("org_id, role, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: true }),
    ]);

    profileDefaultOrg = profile?.default_org_id ?? null;
    memberships = memberRows ?? [];
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 rounded-3xl border border-dashed border-white/20 bg-slate-950/60 p-8 text-slate-200">
      <h1 className="text-2xl font-semibold text-white">Finish workspace setup</h1>
      <p className="text-sm text-slate-300">
        You don’t have an active StoneOpsPro workspace yet. Ask an administrator
        to invite you to an organization or set a default workspace in Supabase
        by updating your profile and org membership records.
      </p>
      <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
        <li>
          Ensure your user appears in <code>org_members</code> with status <strong>active</strong>.
        </li>
        <li>
          Optionally set <code>profiles.default_org_id</code> so we can route you automatically.
        </li>
      </ul>

      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Current Supabase state
        </h2>
        <dl className="mt-4 grid gap-3 text-sm text-slate-300">
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Auth user ID
            </dt>
            <dd className="font-mono text-xs text-slate-400">{user?.id ?? "not signed in"}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              profiles.default_org_id
            </dt>
            <dd className="font-mono text-xs text-slate-200">
              {profileDefaultOrg ?? "null"}
            </dd>
          </div>
        </dl>

        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            org_members rows for this user
          </h3>
          {memberships.length === 0 ? (
            <p className="mt-2 text-xs text-slate-500">No memberships found.</p>
          ) : (
            <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-900/70 text-slate-400">
                  <tr>
                    <th className="px-3 py-2 font-semibold">org_id</th>
                    <th className="px-3 py-2 font-semibold">role</th>
                    <th className="px-3 py-2 font-semibold">status</th>
                  </tr>
                </thead>
                <tbody>
                  {memberships.map((membership) => (
                    <tr key={membership.org_id} className="odd:bg-slate-950/40">
                      <td className="px-3 py-2 font-mono text-[11px]">
                        {membership.org_id}
                      </td>
                      <td className="px-3 py-2">{membership.role}</td>
                      <td className="px-3 py-2">{membership.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Once your membership is configured, refresh the page to continue.
      </p>
    </div>
  );
}