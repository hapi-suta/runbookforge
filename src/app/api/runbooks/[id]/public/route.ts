import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Get a public runbook (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // First check if it's from Knowledge Base (approved entry)
    const { data: kbEntry } = await supabase
      .from('kb_entries')
      .select('runbook_id')
      .eq('runbook_id', id)
      .eq('status', 'approved')
      .single();

    // Get the runbook
    const { data: runbook, error } = await supabase
      .from('runbooks')
      .select('id, title, description, sections, is_public, created_at')
      .eq('id', id)
      .single();

    if (error || !runbook) {
      return NextResponse.json({ error: 'Runbook not found' }, { status: 404 });
    }

    // Check if accessible (public or in KB)
    if (!runbook.is_public && !kbEntry) {
      return NextResponse.json({ error: 'This runbook is not public' }, { status: 403 });
    }

    // Increment view count if from KB
    if (kbEntry) {
      // Simple increment
      const { data: currentEntry } = await supabase
        .from('kb_entries')
        .select('view_count')
        .eq('runbook_id', id)
        .single();
      
      if (currentEntry) {
        await supabase
          .from('kb_entries')
          .update({ view_count: (currentEntry.view_count || 0) + 1 })
          .eq('runbook_id', id);
      }
    }

    return NextResponse.json(runbook);
  } catch (error) {
    console.error('Error fetching public runbook:', error);
    return NextResponse.json({ error: 'Failed to fetch runbook' }, { status: 500 });
  }
}
