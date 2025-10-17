const mockSchedule = [
  {
    resource: "CNC 1",
    job: "Donovan Residence",
    start: "Tue 14 Oct · 8:00",
    end: "Tue 14 Oct · 12:00",
    status: "Confirmed",
  },
  {
    resource: "Waterjet",
    job: "Meridian Apartments",
    start: "Wed 15 Oct · 9:30",
    end: "Wed 15 Oct · 13:30",
    status: "Hold",
  },
  {
    resource: "Install Crew B",
    job: "Kingsley Kitchen",
    start: "Thu 16 Oct · 7:30",
    end: "Thu 16 Oct · 16:00",
    status: "Pending",
  },
];

export const metadata = {
  title: "Scheduling",
};

export default function SchedulingPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Scheduling</h1>
          <p className="text-sm text-slate-400">
            Drag-and-drop board with crews, machines, and conflict detection.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10">
            Manage resources
          </button>
          <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
            Create job
          </button>
        </div>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Board overview</h2>
          <span className="text-xs text-slate-400">Week of 13 Oct</span>
        </div>
        <div className="mt-6 h-80 w-full rounded-2xl border border-white/10 bg-slate-950/60" />
        <p className="mt-3 text-xs text-slate-500">
          Calendar component placeholder. Planned implementation: resource lanes
          with drag-and-drop (React Big Calendar + custom constraints).
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">Upcoming assignments</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-200">
            <thead>
              <tr>
                <th className="py-3 pr-4 font-semibold">Resource</th>
                <th className="py-3 pr-4 font-semibold">Job</th>
                <th className="py-3 pr-4 font-semibold">Start</th>
                <th className="py-3 pr-4 font-semibold">End</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockSchedule.map((event) => (
                <tr key={`${event.resource}-${event.start}`} className="transition hover:bg-white/5">
                  <td className="py-3 pr-4">{event.resource}</td>
                  <td className="py-3 pr-4">{event.job}</td>
                  <td className="py-3 pr-4 text-slate-300">{event.start}</td>
                  <td className="py-3 pr-4 text-slate-300">{event.end}</td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-200">
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-dashed border-white/20 bg-slate-950/60 p-8 text-sm text-slate-300">
        <h3 className="text-lg font-semibold text-white">Scheduling roadmap</h3>
        <ul className="mt-4 space-y-2">
          <li>• Define resources table (machines, crews, installers).</li>
          <li>• Implement conflict detection and utilization metrics.</li>
          <li>• Add optimization suggestions (phase two).</li>
        </ul>
      </section>
    </div>
  );
}