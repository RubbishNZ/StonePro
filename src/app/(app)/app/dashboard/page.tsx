import type { Metadata } from "next";

import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  Layers,
  MapPin,
  PackageSearch,
  ScanBarcode,
} from "lucide-react";

import { requireUserAndOrg } from "@/lib/server/organizations";

export const metadata: Metadata = {
  title: "Dashboard",
};

type InventorySummaryRow = {
  id: string;
  barcode: string | null;
  status: string;
  area_m2: number | null;
  thickness_mm: number | null;
  created_at: string;
  materials: { name: string | null; sku: string | null } | null;
  locations: { code: string | null; name: string | null } | null;
};

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
  if (value == null) return "—";
  if (Number.isNaN(value)) return "—";
  return `${value.toFixed(2)} m²`;
}

type ErrorEntry = { label: string; message: string };

function extractError(label: string, error: { message?: string } | null): ErrorEntry | null {
  if (!error || typeof error !== "object") {
    return null;
  }
  if (!error.message) {
    return null;
  }
  return { label, message: error.message };
}

export default async function DashboardPage() {
  const { supabase } = await requireUserAndOrg();

  const [
    inventoryTotalResponse,
    reservedItemsResponse,
    materialsResponse,
    locationsResponse,
    recentItemsResponse,
  ] = await Promise.all([
    supabase.from("inventory_items").select("id", { count: "exact", head: true }),
    supabase
      .from("inventory_items")
      .select("id", { count: "exact", head: true })
      .eq("status", "reserved"),
    supabase.from("materials").select("id", { count: "exact", head: true }),
    supabase.from("locations").select("id", { count: "exact", head: true }),
    supabase
      .from("inventory_items")
      .select(
        `id, barcode, status, area_m2, thickness_mm, created_at,
         materials(name, sku),
         locations(code, name)`
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = {
    totalItems: inventoryTotalResponse.count ?? 0,
    reservedItems: reservedItemsResponse.count ?? 0,
    materials: materialsResponse.count ?? 0,
    locations: locationsResponse.count ?? 0,
  };

  const availableItems = Math.max(stats.totalItems - stats.reservedItems, 0);
  const reservedRatio =
    stats.totalItems > 0 ? Math.round((stats.reservedItems / stats.totalItems) * 100) : 0;

  const recentItems = (recentItemsResponse.data ?? []) as InventorySummaryRow[];

  const errors = [
    extractError("Inventory count", inventoryTotalResponse.error),
    extractError("Reserved count", reservedItemsResponse.error),
    extractError("Materials count", materialsResponse.error),
    extractError("Locations count", locationsResponse.error),
    extractError("Recent inventory", recentItemsResponse.error),
  ].filter(Boolean) as ErrorEntry[];

  const numberFormatter = new Intl.NumberFormat("en-NZ");
  const datetimeFormatter = new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const statsCards = [
    {
      label: "Inventory items",
      value: numberFormatter.format(stats.totalItems),
      sublabel:
        stats.totalItems > 0
          ? `${availableItems} available`
          : "Add your first inventory item",
      icon: Layers,
    },
    {
      label: "Reserved items",
      value: numberFormatter.format(stats.reservedItems),
      sublabel:
        stats.totalItems > 0 ? `${reservedRatio}% of inventory` : "No reservations yet",
      icon: ClipboardList,
    },
    {
      label: "Materials tracked",
      value: numberFormatter.format(stats.materials),
      sublabel:
        stats.materials > 0
          ? "Active SKUs in catalog"
          : "Define materials before receiving",
      icon: PackageSearch,
    },
    {
      label: "Active locations",
      value: numberFormatter.format(stats.locations),
      sublabel:
        stats.locations > 0
          ? "Storage slots configured"
          : "Add receiving/putaway locations",
      icon: MapPin,
    },
  ];

  const quickActions = [
    {
      title: "Inventory dashboard",
      description: "Review KPIs across stock levels, reservations, and inbound loads.",
      href: "/app/inventory/dashboard",
      icon: BarChart3,
    },
    {
      title: "Slab inventory",
      description: "Manage slab definitions, finishes, and supplier catalogs.",
      href: "/app/inventory/materials",
      icon: PackageSearch,
    },
    {
      title: "Receive items",
      description: "Scan labels, capture photos, and assign storage locations.",
      href: "/app/inventory/receive",
      icon: ScanBarcode,
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

      <section>
        <h1 className="text-3xl font-semibold text-slate-900">Inventory snapshot</h1>
        <p className="mt-2 text-sm text-slate-600">
          Monitor stock levels, reservations, and setup progress for your workspace.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">{card.label}</div>
                  <span className="flex size-10 items-center justify-center rounded-full bg-sky-100 text-sky-600">
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

      <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Latest inventory activity</h2>
              <p className="text-sm text-slate-600">Recent receipts and adjustments.</p>
            </div>
            <a className="text-xs font-semibold text-sky-600" href="/app/inventory/dashboard">
              Open inventory dashboard →
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
                const badgeClass = statusBadgeStyles[item.status] ?? "bg-slate-100 text-slate-700";

                return (
                  <div
                    key={item.id}
                    className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-slate-900">{materialName}</div>
                      <div className="text-xs text-slate-500">
                        {item.barcode ? `Barcode ${item.barcode}` : "No barcode"} · {locationLabel}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatArea(item.area_m2)} · {item.thickness_mm ? `${item.thickness_mm} mm` : "—"}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                        {formatStatus(item.status)}
                      </span>
                      <span className="text-right text-[11px] text-slate-500">
                        {datetimeFormatter.format(new Date(item.created_at))}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
          <p className="mt-1 text-sm text-slate-600">
            Jump into the workflows you use most often.
          </p>
          <div className="mt-6 space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <div
                  key={action.title}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                    <Icon className="size-4" />
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-900">{action.title}</div>
                    <div className="text-xs text-slate-500">{action.description}</div>
                  </div>
                  {action.disabled ? (
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                      Soon
                    </span>
                  ) : (
                    <a
                      href={action.href}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                    >
                      Open
                      <ArrowRight className="size-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}