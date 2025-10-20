import type { Metadata } from "next";

import { ArrowRight, BarChart3, Layers, PackageSearch, Repeat } from "lucide-react";

import { requireUserAndOrg } from "@/lib/server/organizations";

export const metadata: Metadata = {
  title: "Inventory Dashboard",
};

type InventoryBreakdownRow = {
  id: string;
  status: string | null;
  area_m2: number | null;
  created_at: string;
  materials: { name: string | null; sku: string | null } | null;
  locations: { code: string | null; name: string | null } | null;
};

type ErrorEntry = { label: string; message: string };

const inboundStatuses = ["in_transit", "on_order"] as const;

const statusBadgeStyles: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700",
  reserved: "bg-amber-100 text-amber-700",
  hold: "bg-sky-100 text-sky-700",
  on_order: "bg-sky-100 text-sky-700",
  in_transit: "bg-sky-100 text-sky-700",
  damaged: "bg-rose-100 text-rose-700",
  consumed: "bg-slate-200 text-slate-700",
};

function formatStatus(value?: string | null) {
  if (!value) return "";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatArea(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(2)} m²`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-NZ").format(value);
}

function formatPercentage(value: number) {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(0)}%`;
}

function extractError(label: string, error: { message?: string } | null): ErrorEntry | null {
  if (!error?.message) {
    return null;
  }
  return { label, message: error.message };
}

export default async function InventoryDashboardPage() {
  const { supabase } = await requireUserAndOrg();

  const [
    inventoryTotalResponse,
    reservedItemsResponse,
    inboundItemsResponse,
    materialsResponse,
    recentItemsResponse,
    breakdownResponse,
  ] = await Promise.all([
    supabase.from("inventory_items").select("id", { count: "exact", head: true }),
    supabase
      .from("inventory_items")
      .select("id", { count: "exact", head: true })
      .eq("status", "reserved"),
    supabase
      .from("inventory_items")
      .select("id", { count: "exact", head: true })
      .in("status", inboundStatuses),
    supabase.from("materials").select("id", { count: "exact", head: true }),
    supabase
      .from("inventory_items")
      .select(
        `id, status, area_m2, created_at,
         materials(name, sku),
         locations(code, name)`
      )
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("inventory_items")
      .select(
        `id, status, area_m2, created_at,
         materials(name, sku),
         locations(code, name)`
      )
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const stats = {
    totalItems: inventoryTotalResponse.count ?? 0,
    reservedItems: reservedItemsResponse.count ?? 0,
    inboundItems: inboundItemsResponse.count ?? 0,
    materials: materialsResponse.count ?? 0,
  };

  const availableItems = Math.max(stats.totalItems - stats.reservedItems, 0);
  const reservedRatio =
    stats.totalItems > 0 ? Math.round((stats.reservedItems / stats.totalItems) * 100) : 0;

  const recentItems = (recentItemsResponse.data ?? []) as InventoryBreakdownRow[];
  const breakdownItems = (breakdownResponse.data ?? []) as InventoryBreakdownRow[];

  const materialBuckets = new Map<
    string,
    { name: string; count: number; sku: string | null; area: number }
  >();

  const locationBuckets = new Map<string, { label: string; count: number }>();

  let totalTrackedArea = 0;

  for (const item of breakdownItems) {
    const materialName = item.materials?.name?.trim() || "Unspecified material";
    const existingMaterial = materialBuckets.get(materialName) ?? {
      name: materialName,
      sku: item.materials?.sku ?? null,
      count: 0,
      area: 0,
    };
    existingMaterial.count += 1;
    if (typeof item.area_m2 === "number" && !Number.isNaN(item.area_m2)) {
      existingMaterial.area += item.area_m2;
      totalTrackedArea += item.area_m2;
    }
    materialBuckets.set(materialName, existingMaterial);

    const locationKey = item.locations?.code?.trim() || item.locations?.name?.trim() || "Unassigned";
    const existingLocation = locationBuckets.get(locationKey) ?? {
      label: locationKey,
      count: 0,
    };
    existingLocation.count += 1;
    locationBuckets.set(locationKey, existingLocation);
  }

  const materialMix = Array.from(materialBuckets.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const storageDistribution = Array.from(locationBuckets.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const storageTotal = storageDistribution.reduce((acc, entry) => acc + entry.count, 0) || 1;

  const errors = [
    extractError("Inventory count", inventoryTotalResponse.error),
    extractError("Reserved count", reservedItemsResponse.error),
    extractError("Inbound count", inboundItemsResponse.error),
    extractError("Materials count", materialsResponse.error),
    extractError("Recent inventory", recentItemsResponse.error),
    extractError("Breakdown", breakdownResponse.error),
  ].filter(Boolean) as ErrorEntry[];

  const statsCards = [
    {
      label: "Inventory items",
      value: formatNumber(stats.totalItems),
      sublabel:
        stats.totalItems > 0
          ? `${formatNumber(availableItems)} available`
          : "Add your first slab or remnant",
      icon: Layers,
    },
    {
      label: "Reserved",
      value: formatNumber(stats.reservedItems),
      sublabel:
        stats.totalItems > 0 ? `${reservedRatio}% of stock` : "No reservations yet",
      icon: Repeat,
    },
    {
      label: "Inbound pipeline",
      value: formatNumber(stats.inboundItems),
      sublabel:
        stats.inboundItems > 0
          ? "On order or in transit"
          : "Schedule upcoming deliveries",
      icon: BarChart3,
    },
    {
      label: "Materials catalog",
      value: formatNumber(stats.materials),
      sublabel:
        stats.materials > 0
          ? "Active SKUs tracked"
          : "Define materials to unlock workflows",
      icon: PackageSearch,
    },
  ];

  return (
    <div className="space-y-8">
      {errors.length > 0 ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold text-amber-900">Some dashboard data could not be loaded.</p>
          <ul className="mt-2 space-y-1 text-xs text-amber-700">
            {errors.map((entry) => (
              <li key={entry.label}>
                <span className="font-semibold">{entry.label}:</span> {entry.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
            <BarChart3 className="size-3" /> Inventory intelligence
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">Inventory Dashboard</h1>
          <p className="text-sm text-slate-600">
            Monitor stock health, inbound pipeline, and catalog coverage across your warehouse.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="/app/inventory/materials"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
          >
            Slab inventory
            <ArrowRight className="size-4" />
          </a>
          <a
            href="/app/inventory/receive"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Receive items
          </a>
        </div>
      </header>

      <section>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">{card.label}</div>
                  <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <Icon className="size-5" />
                  </span>
                </div>
                <div className="mt-4 text-3xl font-semibold text-slate-900">{card.value}</div>
                <div className="mt-2 text-xs text-slate-500">{card.sublabel}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Inventory health</h2>
              <p className="text-sm text-slate-600">
                Snapshot of available area, inbound loads, and reservation impact.
              </p>
            </div>
            <span className="text-xs text-slate-500">Live metrics</span>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Available stock share
              </div>
              <div className="mt-2 text-3xl font-semibold text-slate-900">
                {stats.totalItems > 0 ? formatPercentage(100 - reservedRatio) : "—"}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Portion of items ready for allocation.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tracked area (sample)
              </div>
              <div className="mt-2 text-3xl font-semibold text-slate-900">
                {totalTrackedArea > 0 ? `${totalTrackedArea.toFixed(1)} m²` : "—"}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Sum of areas across the latest 200 items.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Inbound loads
              </div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">
                {formatNumber(stats.inboundItems)}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Items marked on order or in transit.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Catalog completeness
              </div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">
                {stats.materials > 0 && stats.totalItems > 0
                  ? formatPercentage(Math.min((stats.materials / stats.totalItems) * 100, 100))
                  : "—"}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Materials defined relative to active items.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Material mix</h2>
          <p className="mt-1 text-sm text-slate-600">
            Top materials across the latest receipts and adjustments.
          </p>
          <div className="mt-5 space-y-3">
            {materialMix.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Add materials and receive slabs to populate this view.
              </div>
            ) : (
              materialMix.map((material) => (
                <div
                  key={material.name}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-slate-900/5 text-slate-900">
                    <Layers className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-900">{material.name}</div>
                    <div className="text-xs text-slate-500">
                      {material.sku ? `SKU ${material.sku}` : "Batch pending"}
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div className="text-sm font-semibold text-slate-900">
                      {formatNumber(material.count)} items
                    </div>
                    <div>{material.area > 0 ? `${material.area.toFixed(1)} m²` : "—"}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
              <p className="text-sm text-slate-600">Latest receipts, reservations, and updates.</p>
            </div>
            <a className="text-xs font-semibold text-sky-600" href="/app/inventory/materials">
              Open slab inventory →
            </a>
          </div>
          <div className="mt-6 space-y-4">
            {recentItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Receive your first slab or remnant to see activity here.
              </div>
            ) : (
              recentItems.map((item) => {
                const materialName = item.materials?.name ?? "Material pending";
                const locationLabel = item.locations?.code ?? item.locations?.name ?? "No location";
                const badgeClass = statusBadgeStyles[item.status ?? ""] ?? "bg-slate-100 text-slate-700";

                return (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-slate-900">{materialName}</div>
                      <div className="text-xs text-slate-500">{locationLabel}</div>
                      <div className="text-xs text-slate-500">{formatArea(item.area_m2)}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                        {formatStatus(item.status)}
                      </span>
                      <span className="text-right text-[11px] text-slate-500">
                        {new Intl.DateTimeFormat("en-NZ", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(item.created_at))}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Storage distribution</h2>
            <p className="mt-1 text-sm text-slate-600">
              Top locations by current inventory density.
            </p>
            <div className="mt-5 space-y-3">
              {storageDistribution.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Configure storage locations to visualise distribution.
                </div>
              ) : (
                storageDistribution.map((location) => {
                  const percentage = Math.round((location.count / storageTotal) * 100);
                  return (
                    <div key={location.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-slate-700">
                        <span className="font-semibold text-slate-900">{location.label}</span>
                        <span className="text-xs text-slate-500">{percentage}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-slate-900"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Inventory roadmap</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>• Valuation tracking with landed cost allocations.</li>
              <li>• Aging buckets and replenishment alerts.</li>
              <li>• Reservation prioritisation and shortage signals.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
