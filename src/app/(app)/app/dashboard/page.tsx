import type { Metadata } from "next";

import {
  CalendarCheck,
  ClipboardList,
  Layers,
  TrendingUp,
} from "lucide-react";

import { requireUserAndOrg } from "@/lib/server/organizations";

export const metadata: Metadata = {
  title: "Dashboard",
};

const statusBadgeStyles: Record<string, string> = {
  draft: "bg-white/10 text-white",
  sent: "bg-amber-400/20 text-amber-200",
  accepted: "bg-emerald-400/20 text-emerald-200",
  planned: "bg-white/10 text-white",
  confirmed: "bg-emerald-400/20 text-emerald-200",
  "in_progress": "bg-sky-400/20 text-sky-200",
};

function formatStatus(value?: string | null) {
  if (!value) return "";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function DashboardPage() {
  const { supabase, org } = await requireUserAndOrg();

  const nowIso = new Date().toISOString();

  const [
    quotesAwaitingResponse,
    quoteDraftResponse,
    scheduledEventsResponse,
    reservedSlabsResponse,
    customersResponse,
    pipelineQuotesResponse,
    upcomingEventsResponse,
    orgSettingsResponse,
  ] = await Promise.all([
    supabase
      .from("quotes")
      .select("id", { count: "exact", head: true })
      .eq("org_id", org.id)
      .eq("status", "sent"),
    supabase
      .from("quotes")
      .select("id", { count: "exact", head: true })
      .eq("org_id", org.id)
      .eq("status", "draft"),
    supabase
      .from("schedule_events")
      .select("id", { count: "exact", head: true })
      .eq("org_id", org.id)
      .in("status", ["planned", "confirmed"]),
    supabase
      .from("slabs")
      .select("id", { count: "exact", head: true })
      .eq("org_id", org.id)
      .eq("status", "reserved"),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("org_id", org.id),
    supabase
      .from("quotes")
      .select("*")
      .eq("org_id", org.id)
      .in("status", ["draft", "sent", "accepted"])
      .order("total", { ascending: false })
      .limit(5),
    supabase
      .from("schedule_events")
      .select("*")
      .eq("org_id", org.id)
      .gte("start_time", nowIso)
      .order("start_time", { ascending: true })
      .limit(5),
    supabase
      .from("org_settings")
      .select("currency, timezone")
      .eq("org_id", org.id)
      .maybeSingle(),
  ]);

  const quotesAwaitingCount = quotesAwaitingResponse.count ?? 0;
  const quoteDraftCount = quoteDraftResponse.count ?? 0;
  const scheduledEventsCount = scheduledEventsResponse.count ?? 0;
  const reservedSlabsCount = reservedSlabsResponse.count ?? 0;
  const customersCount = customersResponse.count ?? 0;

  const pipelineQuotes = pipelineQuotesResponse.data ?? [];
  const upcomingEvents = upcomingEventsResponse.data ?? [];
  const orgSettings = orgSettingsResponse.data ?? {
    currency: "NZD",
    timezone: "Pacific/Auckland",
  };

  const logIfRealError = (label: string, err: unknown) => {
    const e = err as { message?: string } | null | undefined;
    if (e && typeof e === "object" && e.message) {
      console.error(label, e);
    }
  };

  logIfRealError("Failed to load pipeline quotes", pipelineQuotesResponse.error);
  logIfRealError("Failed to load upcoming events", upcomingEventsResponse.error);
  logIfRealError("Failed to load org settings", orgSettingsResponse.error);
  logIfRealError("Failed to count sent quotes", quotesAwaitingResponse.error);
  logIfRealError("Failed to count draft quotes", quoteDraftResponse.error);
  logIfRealError("Failed to count schedule events", scheduledEventsResponse.error);
  logIfRealError("Failed to count reserved slabs", reservedSlabsResponse.error);
  logIfRealError("Failed to count customers", customersResponse.error);

  const currencyFormatter = new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: orgSettings.currency ?? "NZD",
    maximumFractionDigits: 0,
  });

  const dateFormatter = new Intl.DateTimeFormat("en-NZ", {
    month: "short",
    day: "numeric",
    weekday: "short",
    timeZone: orgSettings.timezone ?? "Pacific/Auckland",
  });

  const timeFormatter = new Intl.DateTimeFormat("en-NZ", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: orgSettings.timezone ?? "Pacific/Auckland",
  });

  const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
  });

  function formatRelativeDay(value?: string | null) {
    if (!value) return "Just now";
    const deltaMs = new Date(value).getTime() - Date.now();
    const deltaDays = Math.round(deltaMs / (1000 * 60 * 60 * 24));
    return relativeTimeFormatter.format(deltaDays, "day");
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold text-white">Operations overview</h1>
        <p className="mt-2 text-sm text-slate-400">
          Live metrics across quoting, inventory, and scheduling sourced from
          your Supabase workspace.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[{
            label: "Quotes awaiting approval",
            value: quotesAwaitingCount,
            change: `${quoteDraftCount} drafts in progress`,
            icon: ClipboardList,
          },
          {
            label: "Jobs scheduled",
            value: scheduledEventsCount,
            change: "Planned & confirmed events",
            icon: CalendarCheck,
          },
          {
            label: "Slabs reserved",
            value: reservedSlabsCount,
            change: "Pending fabrication or install",
            icon: Layers,
          },
          {
            label: "Active customers",
            value: customersCount,
            change: "Across the current workspace",
            icon: TrendingUp,
          }].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">{card.label}</div>
                  <span className="flex size-10 items-center justify-center rounded-full bg-sky-300/20 text-sky-200">
                    <Icon className="size-5" />
                  </span>
                </div>
                <div className="mt-4 text-3xl font-semibold text-white">{card.value}</div>
                <div className="mt-2 text-xs text-slate-400">{card.change}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Quote pipeline</h2>
              <p className="text-sm text-slate-400">Top opportunities by value.</p>
            </div>
            <a className="text-xs font-semibold text-sky-300" href="/app/quotes">
              View quotes →
            </a>
          </div>
          <div className="mt-6 space-y-4">
            {pipelineQuotes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/60 px-4 py-6 text-sm text-slate-400">
                No quotes yet. Create one to populate the pipeline.
              </div>
            ) : (
              pipelineQuotes.map((quote) => {
                const q = quote as Record<string, any>;
                return (
                  <div
                    key={q.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {(q.reference_no ?? q.project_name ?? q.title ?? "Quote")} · {currencyFormatter.format(q.total ?? 0)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {(q.customers?.name ?? q.customer_name ?? "Unassigned customer")} · Updated {formatRelativeDay(q.updated_at ?? nowIso)}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusBadgeStyles[q.status] ?? "bg-white/10 text-white"
                      }`}
                    >
                      {formatStatus(q.status)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Upcoming installs</h2>
          <ul className="mt-6 space-y-4 text-sm text-slate-300">
            {upcomingEvents.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-white/15 bg-slate-950/60 p-4 text-slate-400">
                No upcoming schedule entries. Add one from the scheduling board.
              </li>
            ) : (
              upcomingEvents.map((event) => {
                const e = event as Record<string, any>;
                return (
                  <li key={e.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">
                        {(e.jobs?.name ?? e.title ?? e.reference ?? "Scheduled job")}
                      </span>
                      <span className="text-xs text-slate-400">
                        {dateFormatter.format(new Date(e.start_time))}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>
                        {(e.resources?.name ?? e.resource_label ?? e.crew_name ?? "Unassigned resource")}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusBadgeStyles[e.status] ?? "bg-white/10 text-white"
                        }`}
                      >
                        {formatStatus(e.status)}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {timeFormatter.format(new Date(e.start_time))} – {timeFormatter.format(new Date(e.end_time))}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Schedule heatmap</h2>
            <p className="text-sm text-slate-400">
              Capacity across machines and install crews. Real-time board lives in scheduling.
            </p>
          </div>
          <a className="text-xs font-semibold text-sky-300" href="/app/scheduling">
            Open board →
          </a>
        </div>
        <div className="mt-4 h-48 rounded-2xl bg-gradient-to-r from-emerald-400/20 via-amber-400/20 to-rose-400/20" />
      </section>
    </div>
  );
}