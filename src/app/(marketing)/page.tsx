import Link from "next/link";

import {
  ArrowRight,
  CalendarCheck,
  ClipboardCheck,
  Layers,
  LineChart,
  PackageSearch,
} from "lucide-react";

export const metadata = {
  title: "StoneOpsPro – Stone fabrication operations platform",
  description:
    "StoneOpsPro unifies quoting, inventory, and scheduling for stone fabrication teams in New Zealand and Australia.",
};

const featureCards = [
  {
    title: "Quotes tied to live inventory",
    description:
      "Build accurate proposals in minutes with pricing rules and slab availability synced from Horus or manual uploads.",
    icon: ClipboardCheck,
  },
  {
    title: "Unified slab visibility",
    description:
      "Track on-order, in-stock, and reserved slabs in one lifecycle-driven view—no more spreadsheet reconciliations.",
    icon: PackageSearch,
  },
  {
    title: "Scheduling built for fabrication",
    description:
      "Assign crews, machines, and installs with a conflict-aware board designed for stone shops, not generic calendars.",
    icon: CalendarCheck,
  },
];

const moduleHighlights = [
  {
    title: "Quoting",
    points: [
      "Rapid quote templates with markup and tax presets",
      "Instant conversion of accepted quotes into jobs",
      "Branded PDFs and email delivery",
    ],
  },
  {
    title: "Inventory",
    points: [
      "Lifecycle statuses from on-order to installed",
      "Horus image references without duplicate hosting",
      "Alerts for low stock and expiring holds",
    ],
  },
  {
    title: "Scheduling",
    points: [
      "Drag-and-drop board with resource lanes",
      "Capacity indicators for crews and machines",
      "Roadmap: optimization engine and mobile updates",
    ],
  },
  {
    title: "System settings",
    points: [
      "Role-based access for owners, schedulers, and installers",
      "Regional settings for AU/NZ taxes, currencies, and units",
      "Integration controls for Horus and Moraware imports",
    ],
  },
];

export default function MarketingHomePage() {
  return (
    <div className="bg-slate-950 text-white">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_55%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-24 sm:px-6 md:flex-row md:items-center">
          <div className="flex-1 space-y-6">
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">
              Built for fabricators
            </span>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              The operational backbone for stone fabrication teams.
            </h1>
            <p className="max-w-xl text-base text-slate-300 sm:text-lg">
              StoneOpsPro replaces Moraware, Excel, and ad-hoc workflows with one
              unified system that keeps quoting, inventory, and scheduling in
              sync—tailored for shops across New Zealand and Australia.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Request beta access
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link
                href="#modules"
                className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
              >
                Explore the platform
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-3">
              {featureCards.map((card) => (
                <div
                  key={card.title}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <card.icon className="mt-1 size-5 text-sky-300" />
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden flex-1 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-6 shadow-xl md:block">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <span className="text-sm text-slate-200">Jobs scheduled this week</span>
                <span className="text-xl font-semibold text-sky-300">34</span>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-sky-300/20 text-sky-200">
                    <Layers className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Inventory synced</p>
                    <p className="text-xs text-slate-400">Horus + manual uploads · 15m cadence</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-xs text-slate-400">
                  <p>• 212 slabs in stock</p>
                  <p>• 48 on order</p>
                  <p>• 19 reserved for live jobs</p>
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Quote win rate</span>
                  <span className="font-semibold text-sky-300">+26%</span>
                </div>
                <div className="mt-3 h-24 rounded-xl bg-gradient-to-r from-sky-500/40 via-sky-400/30 to-slate-500/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="modules" className="border-t border-white/5 bg-slate-950">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-20 sm:px-6 md:grid-cols-2">
          {moduleHighlights.map((module) => (
            <div key={module.title} className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-white/10 text-sm font-semibold uppercase tracking-wide text-slate-200">
                  {module.title}
                </span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                {module.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex size-5 items-center justify-center rounded-full bg-sky-300/20 text-[10px] font-semibold text-sky-200">
                      ●
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-20 sm:px-6 md:flex-row md:items-center">
          <div className="flex-1 space-y-4">
            <h2 className="text-3xl font-semibold sm:text-4xl">Connect your existing stack.</h2>
            <p className="text-base text-slate-300">
              StoneOpsPro integrates with Horus scanners today and has a migration
              path for Moraware Systemize. Import historical jobs, match slab
              images, and keep your physical and digital inventory in sync.
            </p>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <LineChart className="size-4 text-sky-300" /> Near real-time Horus sync via secure connector
              </li>
              <li className="flex items-center gap-2">
                <Layers className="size-4 text-sky-300" /> Manual uploads with CDN-accelerated image hosting
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="size-4 text-sky-300" /> Guided CSV imports for Excel and Moraware exports
              </li>
            </ul>
          </div>
          <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-lg font-semibold text-slate-100">Roadmap spotlight</h3>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <p className="flex items-center gap-2">
                <ArrowRight className="size-4 text-sky-300" /> Constraint-based scheduling optimization
              </p>
              <p className="flex items-center gap-2">
                <ArrowRight className="size-4 text-sky-300" /> Install crew mobile app with offline checklists
              </p>
              <p className="flex items-center gap-2">
                <ArrowRight className="size-4 text-sky-300" /> Supplier scorecards and profitability analytics
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-slate-950">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-3xl font-semibold sm:text-4xl">Ready for your pilot shop?</h2>
          <p className="mt-4 text-base text-slate-300">
            We’re onboarding a limited number of fabrication teams across New
            Zealand and Australia for our beta. Bring your data, and we’ll handle
            the migration.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Join the waitlist
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
            >
              Talk to the team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}