import Link from "next/link";

export const metadata = {
  title: "Check your email",
};

export default function SignupConfirmPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
      <div className="space-y-4">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-sky-300/20 text-sky-200">
          ✓
        </div>
        <h1 className="text-3xl font-semibold">Check your inbox</h1>
        <p className="text-sm text-slate-400">
          We’ve sent a confirmation email to finish setting up your StoneOpsPro
          account. Once verified, you can log in and complete your workspace
          onboarding.
        </p>
      </div>
      <Link
        href="/login"
        className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
      >
        Back to log in
      </Link>
    </div>
  );
}