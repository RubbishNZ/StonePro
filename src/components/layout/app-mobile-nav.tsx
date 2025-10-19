'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Menu, X } from "lucide-react";

import { appNavSections } from "@/components/layout/app-nav-config";
import { cn } from "@/lib/utils";

export function AppMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-40 bg-slate-900/70 backdrop-blur-sm">
          <div className="mx-auto flex h-full w-full max-w-sm flex-col gap-6 px-5 py-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
                Navigation
              </span>
              <button
                type="button"
                onClick={close}
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                aria-label="Close navigation"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
              {appNavSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-200">
                    {section.title}
                  </div>
                  <div className="flex flex-col gap-2">
                    {section.links.map((link) => {
                      const Icon = link.icon;
                      const href = link.href ?? "#";
                      const isActive =
                        !link.disabled &&
                        (pathname === href || pathname.startsWith(`${href}/`));

                      if (link.disabled || !link.href) {
                        return (
                          <div
                            key={`${section.title}-${link.label}`}
                            className="flex items-center gap-3 rounded-2xl border border-slate-400/50 bg-slate-200/40 px-4 py-3 text-slate-200/90"
                          >
                            <Icon className="size-4" />
                            <span className="flex-1 text-sm font-medium">{link.label}</span>
                            <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400/80">
                              Soon
                            </span>
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={close}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl border px-4 py-3 transition",
                            isActive
                              ? "border-slate-200 bg-white text-slate-900 shadow-sm"
                              : "border-transparent bg-white/90 text-slate-800 hover:border-slate-200 hover:bg-white"
                          )}
                        >
                          <Icon className="size-4" />
                          <span className="flex-1 text-sm font-medium">{link.label}</span>
                          {link.badge ? (
                            <span className="rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-200">
                              {link.badge}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
