export const metadata = {
  title: "Inventory dashboard",
};

export default function InventoryDashboardPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Inventory dashboard</h1>
        <p className="text-sm text-slate-600">
          High-level view of stock, reservations, and incoming deliveries. Detailed analytics will
          appear here as the module expands.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Coming soon</h2>
        <p className="mt-2 text-sm text-slate-600">
          KPI cards, stock movement trends, and location utilization insights will surface in this
          dashboard. Use the other inventory tools in the meantime while this view is being built
          out.
        </p>
      </section>
    </div>
  );
}
