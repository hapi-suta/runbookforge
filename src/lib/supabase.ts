import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
