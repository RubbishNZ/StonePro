export const metadata = {
  title: "Quote settings",
};

export default function QuoteSettingsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Quote settings</h1>
        <p className="text-sm text-slate-600">
          Manage templates, markups, approval rules, and integration preferences for quoting.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Coming soon</h2>
        <p className="mt-2 text-sm text-slate-600">
          Configure default payment terms, workflow steps, and sync settings with your ERP once this
          module is released.
        </p>
      </section>
    </div>
  );
}
