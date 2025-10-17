const plans = [
  {
    name: "Horus-connected",
    price: "$800",
    period: "per month",
    headline: "Supabase-hosted app + Horus image pass-through",
    bullets: [
      "Unlimited users and roles",
      "15-minute Horus inventory sync",
      "Quoting, scheduling, inventory modules included",
      "Guided onboarding + data migration",
    ],
  },
  {
    name: "StoneOps image hosting",
    price: "$800",
    period: "+ storage usage",
    headline: "For shops without Horus scanners",
    bullets: [
      "Unlimited users and roles",
      "Supabase storage + CDN-accelerated images",
      "Storage and bandwidth tiers based on usage",
      "Lifecycle statuses and manual uploads",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="bg-slate-950 text-white">
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <h1 className="text-4xl font-semibold sm:text-5xl">Transparent pricing.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300">
            One price for unlimited seats. Choose whether you keep images within
            Horus or host them directly with StoneOpsPro. Pay only for storage
            overage when you need it.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-8"
            >
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {plan.name}
                </span>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-semibold">{plan.price}</span>
                  <span className="pb-1 text-sm text-slate-300">{plan.period}</span>
                </div>
                <p className="text-sm text-slate-300">{plan.headline}</p>
              </div>
              <ul className="mt-8 flex flex-1 flex-col gap-3 text-sm text-slate-300">
                {plan.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span className="mt-1 inline-flex size-4 items-center justify-center rounded-full bg-sky-300/20 text-[10px] text-sky-200">
                      ●
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-6 text-sm text-slate-400">
                Storage tiers published at launch (100GB included, then
                metered). Volume pricing for multi-site groups.
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <h2 className="text-2xl font-semibold">Enterprise & multi-facility</h2>
          <p className="mt-3 text-sm text-slate-300">
            Need API access, custom SLAs, or enterprise agreements? Contact us
            for tailored pricing across multiple fabrication sites.
          </p>
          <a
            href="mailto:hello@stoneopspro.com"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Email the team
          </a>
        </div>
      </section>
    </div>
  );
}