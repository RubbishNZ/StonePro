'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CalendarCheck,
  FileSpreadsheet,
  LayoutDashboard,
  Layers,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  {
    href: "/app/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/app/quotes",
    label: "Quotes",
    icon: FileSpreadsheet,
  },
  {
    href: "/app/inventory",
    label: "Inventory",
    icon: Layers,
  },
  {
    href: "/app/scheduling",
    label: "Scheduling",
    icon: CalendarCheck,
  },
  {
    href: "/app/settings",
    label: "Settings",
    icon: Settings,
  },
];

type AppSidebarProps = {
  orgName?: string | null;
};

export function AppSidebar({ orgName }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r border-white/10 bg-slate-950/80 p-6 text-sm text-slate-300 lg:flex">
      <div className="mb-8 space-y-1">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Workspace</div>
        <div className="text-lg font-semibold text-white">{orgName ?? "StoneOpsPro"}</div>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 transition", 
                isActive
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="size-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}