export const metadata = {
  title: "Factory scheduling",
};

export default function FactorySchedulingPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Factory scheduling</h1>
        <p className="text-sm text-slate-400">
          Interactive production board for managing machines, crews, and capacity constraints.
        </p>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">Scheduler canvas</h2>
        <div className="mt-4 h-96 rounded-2xl border border-white/10 bg-slate-950/50" />
        <p className="mt-3 text-xs text-slate-500">
          Drag-and-drop interface with real-time conflict detection will live here. This placeholder
          represents the future interactive board.
        </p>
      </section>

      <section className="rounded-3xl border border-dashed border-white/20 bg-slate-950/60 p-8 text-sm text-slate-300">
        <h3 className="text-lg font-semibold text-white">Next steps</h3>
        <ul className="mt-4 space-y-2">
          <li>• Define Supabase schema for jobs, tasks, and resource assignments.</li>
          <li>• Integrate availability rules from shop calendar.</li>
          <li>• Surface conflicts and suggested resolutions inline.</li>
        </ul>
      </section>
    </div>
  );
}
