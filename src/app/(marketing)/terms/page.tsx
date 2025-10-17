export default function TermsPage() {
  return (
    <div className="bg-slate-950 text-white">
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <h1 className="text-4xl font-semibold">Terms of service</h1>
        <p className="mt-4 text-sm text-slate-400">
          Draft terms—final legal review pending launch
        </p>
        <div className="mt-10 space-y-6 text-sm leading-6 text-slate-300">
          <p>
            These draft terms describe the intended structure for StoneOpsPro’s
            SaaS agreement. They cover subscription scope, acceptable use,
            billing, data residency (Supabase Sydney), and support response
            times. Final language will be provided by counsel before customer
            onboarding.
          </p>
          <p>
            Subscriptions renew monthly. Cancellation takes effect at the end of
            the billing period. Data exports will be available to the customer
            in CSV/Excel format for core entities (inventory, quotes, jobs).
          </p>
          <p>
            Please contact <a className="underline-offset-4 hover:underline" href="mailto:hello@stoneopspro.com">hello@stoneopspro.com</a> if you have questions or
            require an enterprise agreement.
          </p>
        </div>
      </section>
    </div>
  );
}