export default function PrivacyPage() {
  return (
    <div className="bg-slate-950 text-white">
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <h1 className="text-4xl font-semibold">Privacy policy</h1>
        <p className="mt-4 text-sm text-slate-400">
          Last updated {new Date().getFullYear()}-01-01
        </p>
        <div className="mt-10 space-y-6 text-sm leading-6 text-slate-300">
          <p>
            StoneOpsPro is committed to protecting the privacy of your team and
            customers. This placeholder policy will be replaced with the final
            legal copy before launch. It will outline the data we collect, how we
            use it, and the controls available to your organization.
          </p>
          <p>
            Supabase provides managed database, authentication, storage, and
            logging services. All data is encrypted at rest and in transit.
            Access to organizational records is restricted via row-level
            security configured per tenant.
          </p>
          <p>
            For questions about data handling or to request deletion, email
            <a className="ml-1 underline-offset-4 hover:underline" href="mailto:hello@stoneopspro.com">
              hello@stoneopspro.com
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}