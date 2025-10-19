export async function GET() {
  return Response.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    anonKeyPresent: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceRolePresent: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    nodeEnv: process.env.NODE_ENV ?? null,
  });
}