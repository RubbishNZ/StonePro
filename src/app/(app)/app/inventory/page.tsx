export const metadata = {
  title: "Inventory",
};
import { createSupabaseServerClient } from "@/lib/supabase/server";

type InventoryRow = {
  id: string;
  barcode: string | null;
  status: string;
  area_m2: number;
  thickness_mm: number | null;
  lot: string | null;
  bundle_no: string | null;
  photo_url: string | null;
  materials: { name: string; sku: string | null } | null;
  locations: { code: string } | null;
};

export default async function InventoryPage() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("inventory_items")
    .select(
      `id, barcode, status, area_m2, thickness_mm, lot, bundle_no, photo_url,
       materials(name, sku),
       locations(code)`
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const items: InventoryRow[] = (data as any) ?? [];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Inventory</h1>
          <p className="text-sm text-slate-600">
            Unified view across received items, transfers, and reservations.
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/app/inventory/receive"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Receive items
          </a>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error.message}
          <div className="mt-2 text-xs text-rose-600">
            If this is an RLS error, ensure your user has a row in
            <code className="mx-1">profiles</code> with a valid
            <code className="mx-1">tenant_id</code>. You can use
            <a className="mx-1 underline" href="/app/setup">
              setup
            </a>
            to verify.
          </div>
        </div>
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Current stock</h2>
            <span className="text-xs text-slate-500">Showing {items.length} items</span>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-600">
              <thead>
                <tr>
                  <th className="py-3 pr-4 font-semibold text-slate-500">Material</th>
                  <th className="py-3 pr-4 font-semibold text-slate-500">Barcode</th>
                  <th className="py-3 pr-4 font-semibold text-slate-500">Status</th>
                  <th className="py-3 pr-4 font-semibold text-slate-500">Area (m²)</th>
                  <th className="py-3 pr-4 font-semibold text-slate-500">Thickness</th>
                  <th className="py-3 pr-4 font-semibold text-slate-500">Lot/Bundle</th>
                  <th className="py-3 pr-4 font-semibold text-slate-500">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50/80">
                    <td className="py-3 pr-4">
                      <span className="text-slate-900">{item.materials?.name ?? "Unknown"}</span>
                      <span className="ml-2 text-xs text-slate-500">
                        {item.materials?.sku ?? ""}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {item.barcode ?? "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{item.area_m2?.toFixed(3)}</td>
                    <td className="py-3 pr-4 text-slate-600">{item.thickness_mm ?? "—"} mm</td>
                    <td className="py-3 pr-4 text-slate-600">
                      {item.lot ?? "—"}
                      {item.bundle_no ? ` / ${item.bundle_no}` : ""}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{item.locations?.code ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}