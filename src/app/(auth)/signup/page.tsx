import Link from "next/link";

import { SignupForm } from "./signup-form";

export const metadata = {
  title: "Request access",
};

export default function SignupPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="space-y-2">
        <Link href="/" className="text-sm text-slate-400 underline-offset-4 hover:underline">
          ← Back to marketing site
        </Link>
        <h1 className="text-3xl font-semibold">Request StoneOpsPro access</h1>
        <p className="text-sm text-slate-400">
          We’ll review your request and share the beta onboarding pack. Only a
          few pilot shops are accepted each month.
        </p>
      </div>
      <SignupForm />
    </div>
  );
}