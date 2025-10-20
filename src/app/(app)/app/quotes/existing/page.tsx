const mockQuotes = [
  {
    reference: "Q-1054",
    customer: "Harbourview Homes",
    total: "$42,800",
    status: "Draft",
    owner: "S. Patel",
    updated: "2h ago",
  },
  {
    reference: "Q-1053",
    customer: "Mason & Co",
    total: "$68,120",
    status: "Sent",
    owner: "L. Chen",
    updated: "Yesterday",
  },
  {
    reference: "Q-1052",
    customer: "InteriorFX",
    total: "$25,600",
    status: "Accepted",
    owner: "R. Williams",
    updated: "Mon 6 Oct",
  },
];

export const metadata = {
  title: "Existing quotes",
};

export default function ExistingQuotesPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Existing quotes</h1>
        <p className="text-sm text-slate-400">
          Review proposals in progress, track approvals, and quickly pick up a quote where you left
          off.
        </p>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Quotes list</h2>
            <p className="text-sm text-slate-400">Recent activity across the quoting team.</p>
          </div>
          <div className="flex gap-3">
            <button className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10">
              Filter status
            </button>
            <button className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10">
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-200">
            <thead>
              <tr>
                <th className="py-3 pr-4 font-semibold">Reference</th>
                <th className="py-3 pr-4 font-semibold">Customer</th>
                <th className="py-3 pr-4 font-semibold">Owner</th>
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
                  <td className="py-3 pr-4 text-slate-300">{quote.owner}</td>
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
        <h3 className="text-lg font-semibold text-white">Upcoming enhancements</h3>
        <ul className="mt-4 space-y-2">
          <li>• Search across quote numbers, customers, and materials.</li>
          <li>• Bulk status updates and reminders to follow up.</li>
          <li>• Attachments and notes to improve collaboration.</li>
        </ul>
      </section>
    </div>
  );
}
