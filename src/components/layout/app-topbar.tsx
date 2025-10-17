'use client';

import { useState } from "react";
import { useFormStatus } from "react-dom";

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
    <header className="flex items-center justify-between border-b border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-2">
        <span className="text-sm uppercase tracking-[0.3em] text-slate-500">
          {orgName ?? "StoneOpsPro"}
        </span>
        <span className="text-sm text-slate-400">Workspace dashboard</span>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-white/30"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-sky-300/20 text-sky-100">
            {email?.[0]?.toUpperCase() ?? "S"}
          </span>
          <span className="hidden text-left text-xs leading-tight sm:block">
            <span className="block font-semibold">{email ?? "user@stoneops.pro"}</span>
            <span className="text-slate-400">{displayRole}</span>
          </span>
        </button>
        {isMenuOpen ? (
          <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-slate-950/95 p-3 shadow-lg">
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