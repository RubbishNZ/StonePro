import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { RootProviders } from "@/components/providers/root-providers";
import { cn } from "@/lib/utils";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "StoneOpsPro",
    template: "%s | StoneOpsPro",
  },
  description:
    "StoneOpsPro unifies quoting, inventory, and scheduling for stone fabricators in a single cloud platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "bg-background text-foreground antialiased"
        )}
      >
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
