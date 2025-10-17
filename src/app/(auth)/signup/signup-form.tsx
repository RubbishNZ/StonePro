'use client';

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

import { signUpAction } from "./actions";

type SignUpState = {
  error?: string;
  success?: boolean;
};

const initialState: SignUpState = {};

export function SignupForm() {
  const [state, formAction] = useActionState(signUpAction, initialState);

  useEffect(() => {
    if (state?.success) {
      window.location.href = "/signup/confirm";
    }
  }, [state?.success]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full name" htmlFor="fullName">
          <input
            id="fullName"
            name="fullName"
            required
            placeholder="Jessie Ward"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
          />
        </Field>
        <Field label="Company" htmlFor="company">
          <input
            id="company"
            name="company"
            required
            placeholder="Southern Stone Fabricators"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
          />
        </Field>
      </div>
      <Field label="Work email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="jessie@stonefabricators.com.au"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
        />
      </Field>
      <Field label="Password" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
        />
      </Field>
      {state?.error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      ) : null}
      <SubmitButton />
      <p className="text-sm text-slate-400">
        Already invited?{" "}
        <Link href="/login" className="font-semibold text-white underline-offset-4 hover:underline">
          Log in here
        </Link>
      </p>
    </form>
  );
}

type FieldProps = {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
};

function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div className="space-y-2 text-sm">
      <label htmlFor={htmlFor} className="block font-semibold text-slate-200">
        {label}
      </label>
      {children}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Submitting..." : "Request access"}
    </button>
  );
}