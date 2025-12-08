import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy-loaded clients to avoid build-time errors
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Missing Supabase env vars');
    _supabase = createClient(url, key);
  }
  return _supabase;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Missing Supabase admin env vars');
    _supabaseAdmin = createClient(url, key);
  }
  return _supabaseAdmin;
}

// Legacy export for backwards compatibility (lazy)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as unknown as Record<string, unknown>)[prop as string];
  }
});

// Types for our database
export interface Runbook {
  id: string
  user_id: string
  title: string
  description: string | null
  sections: Section[]
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Section {
  id: string
  title: string
  blocks: Block[]
  isCollapsed?: boolean
}

export interface Block {
  id: string
  type: 'step' | 'code' | 'warning' | 'info' | 'success' | 'note'
  content: string
  title?: string
  language?: string
  serverRole?: string
}
