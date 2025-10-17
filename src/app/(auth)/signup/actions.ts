'use server';

import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type SignUpState = {
  error?: string;
  success?: boolean;
};

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  company: z.string().min(2),
});

export async function signUpAction(
  _prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const submission = signUpSchema.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    fullName: String(formData.get("fullName") ?? "").trim(),
    company: String(formData.get("company") ?? "").trim(),
  });

  if (!submission.success) {
    return { error: "Please review the highlighted fields." };
  }

  const { email, password, fullName, company } = submission.data;

  let supabase;
  try {
    supabase = createSupabaseServerClient();
  } catch (error) {
    console.error("Supabase client initialization failed", error);
    return {
      error:
        "Supabase credentials are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart the dev server.",
    };
  }
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        company,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/login`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}