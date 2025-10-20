import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  CalendarClock,
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  Layers,
  Repeat,
  ScanBarcode,
  Search,
  Settings,
} from "lucide-react";

export type AppNavLink = {
  label: string;
  href?: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
  disabled?: boolean;
};

export type AppNavSection = {
  title: string;
  links: AppNavLink[];
};

export const appNavSections: AppNavSection[] = [
  {
    title: "Overview",
    links: [
      {
        label: "Dashboard",
        href: "/app/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Global search",
        href: "/app/inventory/search",
        icon: Search,
        disabled: true,
      },
    ],
  },
  {
    title: "Inventory",
    links: [
      {
        label: "Inventory dashboard",
        href: "/app/inventory/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Receiving",
        href: "/app/inventory/receive",
        icon: ScanBarcode,
        badge: "Beta",
      },
      {
        label: "Slab inventory",
        href: "/app/inventory/materials",
        icon: Layers,
      },
      {
        label: "Inventory settings",
        href: "/app/inventory/settings",
        icon: Settings,
      },
      {
        label: "Purchase orders",
        href: "/app/inventory/purchase-orders",
        icon: ClipboardList,
        disabled: true,
      },
      {
        label: "Putaway & transfers",
        href: "/app/inventory/transfers",
        icon: Repeat,
        disabled: true,
      },
      {
        label: "Reservations",
        href: "/app/inventory/reservations",
        icon: BadgeCheck,
        disabled: true,
      },
    ],
  },
  {
    title: "Quoting",
    links: [
      {
        label: "Quoting dashboard",
        href: "/app/quotes",
        icon: LayoutDashboard,
      },
      {
        label: "Quote settings",
        href: "/app/quotes/settings",
        icon: Settings,
      },
      {
        label: "New quote",
        href: "/app/quotes/new",
        icon: FilePlus2,
      },
      {
        label: "Existing quotes",
        href: "/app/quotes/existing",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "Scheduling",
    links: [
      {
        label: "Factory dashboard",
        href: "/app/scheduling",
        icon: LayoutDashboard,
      },
      {
        label: "Factory scheduling",
        href: "/app/scheduling/factory-scheduling",
        icon: CalendarClock,
      },
      {
        label: "Factory settings",
        href: "/app/scheduling/settings",
        icon: Settings,
      },
    ],
  },
  {
    title: "Administration",
    links: [
      {
        label: "Settings",
        href: "/app/settings",
        icon: Settings,
      },
    ],
  },
];
