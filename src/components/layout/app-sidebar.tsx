'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ChevronDown } from "lucide-react";

import { appNavSections } from "@/components/layout/app-nav-config";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  orgName?: string | null;
};

export function AppSidebar({ orgName }: AppSidebarProps) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  return (
    <aside className="hidden w-72 flex-col border-r border-slate-900/40 bg-slate-950/80 p-6 text-sm text-slate-300 lg:flex">
      <div className="mb-8 space-y-1">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Workspace</div>
        <div className="text-lg font-semibold text-white">{orgName ?? "StoneOpsPro"}</div>
      </div>
      <nav className="flex flex-1 flex-col gap-4">
        {appNavSections.map((section, index) => {
          const isSectionActive = section.links.some((link) => {
            const href = link.href;
            if (!href) return false;
            return pathname === href || pathname.startsWith(`${href}/`);
          });

          const defaultOpen = isSectionActive || index === 0;
          const isOpen = openSections[section.title] ?? defaultOpen;

          const toggleSection = () =>
            setOpenSections((prev) => ({
              ...prev,
              [section.title]: !isOpen,
            }));

          return (
            <div key={section.title} className="space-y-2">
              <button
                type="button"
                onClick={toggleSection}
                className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
              >
                <span>{section.title}</span>
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    isOpen ? "rotate-180 text-slate-200" : "text-slate-500",
                  )}
                />
              </button>
              <div className={cn("flex flex-col gap-1", isOpen ? "" : "hidden")}>
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const href = link.href ?? "#";
                  const isActive =
                    !link.disabled &&
                    (pathname === href || pathname.startsWith(`${href}/`));

                  const content = (
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">{link.label}</span>
                      {link.description ? (
                        <span className="text-xs text-slate-500">{link.description}</span>
                      ) : null}
                    </span>
                  );

                  const badge = link.badge ? (
                    <span className="ml-auto rounded-full bg-slate-800 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                      {link.badge}
                    </span>
                  ) : null;

                  if (link.disabled || !link.href) {
                    return (
                      <div
                        key={`${section.title}-${link.label}`}
                        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-slate-500/70"
                      >
                        <Icon className="size-4" />
                        {content}
                        {badge ?? (
                          <span className="ml-auto rounded-full bg-slate-800 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400/80">
                            Soon
                          </span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-2.5 transition",
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <Icon className="size-4" />
                      {content}
                      {badge}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}