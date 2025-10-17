import fs from 'node:fs/promises';
import path from 'node:path';

async function ensureEnv() {
  const cwd = process.cwd();
  const envLocal = path.join(cwd, '.env.local');
  const envExample = path.join(cwd, '.env.example');

  try {
    await fs.access(envLocal);
    console.log('[env] .env.local already exists');
    return;
  } catch {}

  try {
    await fs.access(envExample);
  } catch {
    console.warn('[env] .env.example not found; skipping creation of .env.local');
    return;
  }

  try {
    await fs.copyFile(envExample, envLocal);
    console.log('[env] Created .env.local from .env.example');
    console.log('[env] Fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable Supabase');
  } catch (err) {
    console.warn('[env] Failed to create .env.local:', err?.message ?? err);
  }
}

ensureEnv();
