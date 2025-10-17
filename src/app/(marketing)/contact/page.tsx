export default function ContactPage() {
  return (
    <div className="bg-slate-950 text-white">
      <section className="mx-auto grid max-w-5xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">
            Let’s collaborate
          </span>
          <h1 className="text-4xl font-semibold sm:text-5xl">Talk to the StoneOpsPro team.</h1>
          <p className="text-base text-slate-300">
            We’re partnering with fabrication leaders across New Zealand and
            Australia. Share a few details below and we’ll coordinate a tailored
            demo, pilot timeline, and data onboarding plan.
          </p>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
            <p className="font-semibold text-slate-200">What to expect:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Discovery call to map your quoting, inventory, and scheduling flow.</li>
              <li>Data import checklist for Excel, Moraware, and Horus sources.</li>
              <li>Pilot rollout plan with dedicated migration support.</li>
            </ul>
          </div>
          <div className="space-y-3 text-sm text-slate-300">
            <p>Email: <a className="underline-offset-4 hover:underline" href="mailto:hello@stoneopspro.com">hello@stoneopspro.com</a></p>
            <p>Phone: <a className="underline-offset-4 hover:underline" href="tel:+6444880123">+64 4 880 123</a></p>
          </div>
        </div>
        <form className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="space-y-2 text-sm">
            <label htmlFor="name" className="block font-semibold text-slate-200">
              Your name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Alex Taylor"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
            />
          </div>
          <div className="space-y-2 text-sm">
            <label htmlFor="email" className="block font-semibold text-slate-200">
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="alex@fabrication.co.nz"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
            />
          </div>
          <div className="space-y-2 text-sm">
            <label htmlFor="company" className="block font-semibold text-slate-200">
              Company
            </label>
            <input
              id="company"
              name="company"
              type="text"
              placeholder="StoneCraft Auckland"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
            />
          </div>
          <div className="space-y-2 text-sm">
            <label htmlFor="message" className="block font-semibold text-slate-200">
              Where do you need help most?
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="Tell us about your current tools and gaps."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Request a discovery session
          </button>
          <p className="text-xs text-slate-500">
            By submitting you agree to receive StoneOpsPro product updates. You
            can unsubscribe anytime.
          </p>
        </form>
      </section>
    </div>
  );
}