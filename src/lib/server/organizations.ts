import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { SupabaseClient } from "@supabase/supabase-js";

type GenericSupabaseClient = SupabaseClient<any, "public", any>;

export type ActiveOrgResult = {
  org: {
    id: string;
    name: string;
    slug: string | null;
  };
  membership: {
    org_id: string;
    role: string;
    status: string;
  };
};

// Adapted to StoneOpsPro schema: profiles(user_id, tenant_id, role) -> tenants(id, name)
export async function resolveActiveOrg(
  supabase: GenericSupabaseClient,
  userId: string
): Promise<ActiveOrgResult> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("tenant_id, role, tenants(id, name)")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!profile || !profile.tenant_id) {
    throw new Error("No tenant assigned for this user.");
  }

  const org = profile.tenants ?? {
    id: profile.tenant_id,
    name: "Workspace",
    slug: null,
  };

  return {
    org,
    membership: {
      org_id: profile.tenant_id,
      role: profile.role ?? "member",
      status: "active",
    },
  };
}

export async function requireUserAndOrg() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  try {
    const activeOrg = await resolveActiveOrg(supabase, user.id);

    return {
      supabase,
      user,
      ...activeOrg,
    };
  } catch (error) {
    console.error("Failed to resolve active organization", error);
    redirect("/app/setup");
  }
}