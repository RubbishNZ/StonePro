import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  PackageSearch,
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
        label: "Inventory Dashboard",
        href: "/app/inventory/dashboard",
        icon: BarChart3,
      },
      {
        label: "Receiving",
        href: "/app/inventory/receive",
        icon: ScanBarcode,
        badge: "Beta",
      },
      {
        label: "Slab Inventory",
        href: "/app/inventory/materials",
        icon: PackageSearch,
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
