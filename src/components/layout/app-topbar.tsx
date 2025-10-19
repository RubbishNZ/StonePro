'use client';

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { AppMobileNav } from "@/components/layout/app-mobile-nav";
import { signOutAction } from "@/lib/auth/actions";

type AppTopbarProps = {
  email?: string | null;
  orgName?: string | null;
  role?: string | null;
};

export function AppTopbar({ email, orgName, role }: AppTopbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const displayRole = role
    ? role
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : "Member";

  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-4 py-4 text-slate-900 backdrop-blur-sm xl:px-6">
      <div className="flex items-center gap-3">
        <AppMobileNav />
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {orgName ?? "StoneOpsPro"}
          </span>
          <span className="text-sm text-slate-500">Operations workspace</span>
        </div>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
            {email?.[0]?.toUpperCase() ?? "S"}
          </span>
          <span className="hidden text-left text-xs leading-tight sm:block">
            <span className="block font-semibold">{email ?? "user@stoneops.pro"}</span>
            <span className="text-slate-500">{displayRole}</span>
          </span>
        </button>
        {isMenuOpen ? (
          <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
            <form action={signOutAction}>
              <SignOutButton />
            </form>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Signing out..." : "Log out"}
    </button>
  );
}