const settingsSections = [
  {
    title: "Workspace profile",
    description: "Manage organization name, region, and branding assets.",
    actions: ["Upload logo", "Set timezone", "Configure quote numbering"],
  },
  {
    title: "Roles & permissions",
    description: "Assign roles for owners, admins, schedulers, sales, installers.",
    actions: ["Invite team members", "Adjust module access", "Review audit log"],
  },
  {
    title: "Integrations",
    description: "Connect Horus scanners, Moraware Systemize, and Stripe billing.",
    actions: ["Horus API credentials", "Moraware API token", "Stripe customer portal"],
  },
];

export const metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">System settings</h1>
        <p className="text-sm text-slate-400">
          Configure your workspace, user access, and integrations. Modules below
          map directly to Supabase tables and RLS policies.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        {settingsSections.map((section) => (
          <div
            key={section.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <h2 className="text-lg font-semibold text-white">{section.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{section.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {section.actions.map((action) => (
                <li key={action}>• {action}</li>
              ))}
            </ul>
            <button className="mt-6 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10">
              Manage
            </button>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-dashed border-white/20 bg-slate-950/60 p-8 text-sm text-slate-300">
        <h3 className="text-lg font-semibold text-white">Security checklist</h3>
        <ul className="mt-4 space-y-2">
          <li>• Implement Supabase RLS for org_members, roles, and settings.</li>
          <li>• Add audit trails for quote edits and schedule moves.</li>
          <li>• Configure daily backups and monitor cron jobs.</li>
        </ul>
      </section>
    </div>
  );
}