import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET - Get a public runbook (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // Get the runbook first
    const { data: runbook, error } = await supabase
      .from('runbooks')
      .select('id, title, description, sections, is_public, created_at')
      .eq('id', id)
      .single();

    if (error || !runbook) {
      return NextResponse.json({ error: 'Runbook not found' }, { status: 404 });
    }

    // Check if it's from Knowledge Base (don't fail if table doesn't exist)
    let isFromKB = false;
    try {
      const { data: kbEntry } = await supabase
        .from('kb_entries')
        .select('runbook_id')
        .eq('runbook_id', id)
        .eq('status', 'approved')
        .single();
      
      isFromKB = !!kbEntry;
      
      // Increment view count if from KB
      if (kbEntry) {
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
    } catch (kbError) {
      // KB tables might not exist, that's okay
      console.warn('KB check failed:', kbError);
    }

    // Check if accessible - allow if public OR from approved KB entry
    if (!runbook.is_public && !isFromKB) {
      return NextResponse.json({ error: 'This runbook is not public' }, { status: 403 });
    }

    return NextResponse.json(runbook);
  } catch (error) {
    console.error('Error fetching public runbook:', error);
    return NextResponse.json({ error: 'Failed to fetch runbook' }, { status: 500 });
  }
}
