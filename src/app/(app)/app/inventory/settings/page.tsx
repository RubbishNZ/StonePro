export const metadata = {
  title: "Inventory settings",
};

export default function InventorySettingsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Inventory settings</h1>
        <p className="text-sm text-slate-600">
          Configure receiving preferences, storage locations, and automation rules for your
          inventory workflows.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Configuration coming soon</h2>
        <p className="mt-2 text-sm text-slate-600">
          Settings for locations, reservation policies, and labeling will be available here. Let us
          know which controls you need first so we can prioritise them.
        </p>
      </section>
    </div>
  );
}
