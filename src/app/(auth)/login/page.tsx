import Link from "next/link";

import { LoginForm } from "./login-form";

export const metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="space-y-2">
        <Link href="/" className="text-sm text-slate-400 underline-offset-4 hover:underline">
          ← Back to marketing site
        </Link>
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="text-sm text-slate-400">
          Sign in with your workspace email to access StoneOpsPro.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}