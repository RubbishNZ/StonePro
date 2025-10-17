import type { Metadata } from "next";

import { QuoteBuilder } from "@/features/quotes/components/quote-builder";

export const metadata: Metadata = {
  title: "New quote",
};

export default function NewQuotePage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">New quote</h1>
          <p className="text-sm text-slate-400">
            Sketch your benchtop layout, calibrate it to scale, and see pricing update in real time.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10">
            Cancel
          </button>
          <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
            Save draft
          </button>
        </div>
      </header>

      <QuoteBuilder />
    </div>
  );
}