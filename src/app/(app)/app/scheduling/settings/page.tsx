export const metadata = {
  title: "Factory settings",
};

export default function FactorySettingsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Factory settings</h1>
        <p className="text-sm text-slate-400">
          Configure shift templates, machine capacity, and automation for the production floor.
        </p>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">Configuration coming soon</h2>
        <p className="mt-2 text-sm text-slate-400">
          Manage operating hours, job buffers, and integration hooks from this screen once the
          settings experience is launched.
        </p>
      </section>

      <section className="rounded-3xl border border-dashed border-white/20 bg-slate-950/60 p-8 text-sm text-slate-300">
        <h3 className="text-lg font-semibold text-white">Planned capabilities</h3>
        <ul className="mt-4 space-y-2">
          <li>• Define crew rosters and assign skill matrices.</li>
          <li>• Configure downtime calendars and maintenance alerts.</li>
          <li>• Connect to ERP for job release automation.</li>
        </ul>
      </section>
    </div>
  );
}
