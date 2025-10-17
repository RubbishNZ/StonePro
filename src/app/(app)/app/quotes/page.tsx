import Link from "next/link";

const mockQuotes = [
  {
    reference: "Q-1054",
    customer: "Harbourview Homes",
    total: "$42,800",
    status: "Draft",
    updated: "2h ago",
  },
  {
    reference: "Q-1053",
    customer: "Mason & Co",
    total: "$68,120",
    status: "Sent",
    updated: "Yesterday",
  },
  {
    reference: "Q-1052",
    customer: "InteriorFX",
    total: "$25,600",
    status: "Accepted",
    updated: "Mon 6 Oct",
  },
];

export const metadata = {
  title: "Quotes",
};

export default function QuotesPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Quotes</h1>
          <p className="text-sm text-slate-400">
            Build and manage proposals with live inventory and pricing rules.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10">
            Import from CSV
          </button>
          <Link
            href="/app/quotes/new"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            New quote
          </Link>
        </div>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Pipeline</h2>
          <span className="text-xs text-slate-400">Filters · All reps · Last 30 days</span>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-200">
            <thead>
              <tr>
                <th className="py-3 pr-4 font-semibold">Reference</th>
                <th className="py-3 pr-4 font-semibold">Customer</th>
                <th className="py-3 pr-4 font-semibold">Total</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 pr-4 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockQuotes.map((quote) => (
                <tr key={quote.reference} className="transition hover:bg-white/5">
                  <td className="py-3 pr-4 text-sky-200">{quote.reference}</td>
                  <td className="py-3 pr-4">{quote.customer}</td>
                  <td className="py-3 pr-4">{quote.total}</td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                      {quote.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-300">{quote.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-dashed border-white/20 bg-slate-950/60 p-8 text-sm text-slate-300">
        <h3 className="text-lg font-semibold text-white">Quote module roadmap</h3>
        <ul className="mt-4 space-y-2">
          <li>• Define Supabase tables for quotes, line items, price books.</li>
          <li>• Build PDF renderer for branded proposals.</li>
          <li>• Allow conversion to jobs with slab reservations.</li>
        </ul>
      </section>
    </div>
  );
}