import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Prevent static rendering - this route uses auth headers
export const dynamic = 'force-dynamic';

// POST - Add content to batch
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // Verify batch ownership
    const { data: batch } = await supabase
      .from('training_batches')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const body = await request.json();
    const { module_id, title, content_type, runbook_id, document_id, external_url, generated_content } = body;

    if (!module_id || !title || !content_type) {
      return NextResponse.json({ error: 'module_id, title, and content_type required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('training_content')
      .insert({
        module_id,
        title,
        content_type,
        runbook_id: runbook_id || null,
        document_id: document_id || null,
        external_url: external_url || null,
        generated_content: generated_content || null
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error adding content:', error);
    return NextResponse.json({ error: 'Failed to add content' }, { status: 500 });
  }
}
