import type { Metadata } from "next";

import { requireUserAndOrg } from "@/lib/server/organizations";

import { MaterialsCatalog } from "./materials-catalog";

export const metadata: Metadata = {
  title: "Slab Inventory",
};

export type MaterialRecord = {
  id: string;
  tenant_id: string;
  batch_number?: string | null;
  name: string | null;
  sku: string | null;
  description?: string | null;
  material_type?: string | null;
  category?: string | null;
  color_family?: string | null;
  color_primary?: string | null;
  color_secondary?: string | null;
  finish?: string | null;
  surface_finish?: string | null;
  default_thickness_mm?: number | null;
  lead_time_days?: number | null;
  unit_cost?: number | null;
  currency?: string | null;
  supplier_reference?: string | null;
  slab_length_mm?: number | null;
  slab_width_mm?: number | null;
  status?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
};

export default async function MaterialsCatalogPage() {
  const { supabase, org } = await requireUserAndOrg();
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("tenant_id", org.id)
    .order("name", { ascending: true });

  if (error) {
    return (
      <div className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-slate-900">Slab Inventory</h1>
          <p className="text-sm text-slate-600">
            Create reusable material definitions for slabs, remnants, and special-order stock.
          </p>
        </header>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
          <p className="font-semibold text-rose-900">Unable to load materials.</p>
          <p className="mt-2 text-xs text-rose-700">{error.message}</p>
          <p className="mt-3 text-xs text-rose-600">
            Ensure your Supabase profile is linked to a tenant and the materials table exists.
          </p>
        </div>
      </div>
    );
  }

  const materials = (data ?? []) as MaterialRecord[];

  return <MaterialsCatalog materials={materials} />;
}