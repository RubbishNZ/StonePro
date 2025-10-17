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

export async function resolveActiveOrg(
  supabase: GenericSupabaseClient,
  userId: string
): Promise<ActiveOrgResult> {
  const { data, error } = await supabase
    .from("org_members")
    .select("org_id, role, status, organizations(id, name, slug)")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error("No active organization found for this user.");
  }

  const membership = data[0];

  let org = membership.organizations ?? null;

  if (!org) {
    const { data: fetchedOrg, error: fetchedOrgError } = await supabase
      .from("organizations")
      .select("id, name, slug")
      .eq("id", membership.org_id)
      .maybeSingle();

    if (fetchedOrgError) {
      console.warn("Unable to read organization record via RLS", fetchedOrgError);
    }

    org = fetchedOrg ?? {
      id: membership.org_id,
      name: "Workspace",
      slug: null,
    };
  }

  return {
    org,
    membership: {
      org_id: membership.org_id,
      role: membership.role,
      status: membership.status,
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