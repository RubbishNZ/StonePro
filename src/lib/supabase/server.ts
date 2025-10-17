import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createSupabaseServerClient() {
  const cookieStore = cookies();
  const mutableCookieStore = cookieStore as unknown as {
    get: (name: string) => { value: string } | undefined;
    set?: (options: { name: string; value: string; path?: string; expires?: Date; maxAge?: number }) => void;
    delete?: (options: { name: string; path?: string }) => void;
  };
  const canMutateCookies = typeof mutableCookieStore.set === "function";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase server env vars are missing");
  }

  return createServerClient(url, anonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        if (!canMutateCookies) {
          return;
        }

        try {
          mutableCookieStore.set?.({ name, value, ...options });
        } catch (error) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[supabase] Unable to set cookie", error);
          }
        }
      },
      remove(name, options) {
        if (!canMutateCookies) {
          return;
        }

        try {
          mutableCookieStore.delete?.({ name, ...options });
        } catch (error) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[supabase] Unable to delete cookie", error);
          }
        }
      },
    },
  });
}