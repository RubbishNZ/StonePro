const mockInventory = [
  {
    slab: "Calacatta Oro",
    lot: "LOT-3421",
    status: "In stock",
    thickness: "20mm",
    location: "Aisle 4",
    source: "Horus",
  },
  {
    slab: "Atlantic Quartz",
    lot: "LOT-2290",
    status: "Reserved",
    thickness: "30mm",
    location: "Holding Bay",
    source: "Manual",
  },
  {
    slab: "Silver Mist",
    lot: "PO-5567",
    status: "On order",
    thickness: "20mm",
    location: "Supplier",
    source: "PO Sync",
  },
];

export const metadata = {
  title: "Inventory",
};

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Inventory</h1>
          <p className="text-sm text-slate-400">
            Unified view across Horus scans, purchase orders, and manual uploads.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10">
            Import CSV
          </button>
          <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
            Add slab
          </button>
        </div>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Current stock</h2>
          <span className="text-xs text-slate-400">Last sync · 12:45pm</span>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-200">
            <thead>
              <tr>
                <th className="py-3 pr-4 font-semibold">Slab</th>
                <th className="py-3 pr-4 font-semibold">Lot/Reference</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 pr-4 font-semibold">Thickness</th>
                <th className="py-3 pr-4 font-semibold">Location</th>
                <th className="py-3 pr-4 font-semibold">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockInventory.map((item) => (
                <tr key={item.lot} className="transition hover:bg-white/5">
                  <td className="py-3 pr-4">{item.slab}</td>
                  <td className="py-3 pr-4 text-slate-300">{item.lot}</td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-300">{item.thickness}</td>
                  <td className="py-3 pr-4 text-slate-300">{item.location}</td>
                  <td className="py-3 pr-4 text-slate-300">{item.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-dashed border-white/20 bg-slate-950/60 p-8 text-sm text-slate-300">
        <h3 className="text-lg font-semibold text-white">Next steps</h3>
        <ul className="mt-4 space-y-2">
          <li>• Build Supabase schema for slabs, lots, lifecycle statuses.</li>
          <li>• Connect Horus sync service (SQLite/API) to ingest slab metadata.</li>
          <li>• Implement RLS to scope inventory by organization.</li>
        </ul>
      </section>
    </div>
  );
}