import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Helper to verify content ownership
async function verifyOwnership(supabase: ReturnType<typeof getSupabaseAdmin>, contentId: string, userId: string): Promise<boolean> {
  const { data: content } = await supabase
    .from('training_content')
    .select('module_id')
    .eq('id', contentId)
    .single();

  if (!content) return false;

  const { data: module } = await supabase
    .from('training_modules')
    .select('batch_id')
    .eq('id', content.module_id)
    .single();

  if (!module) return false;

  const { data: batch } = await supabase
    .from('training_batches')
    .select('user_id')
    .eq('id', module.batch_id)
    .single();

  return batch?.user_id === userId;
}

// GET - Get single content item
export async function GET(
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

    // Verify ownership
    if (!(await verifyOwnership(supabase, id, userId))) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    const { data: content, error } = await supabase
      .from('training_content')
      .select(`
        *,
        documents (id, title, metadata),
        runbooks (id, title, sections)
      `)
      .eq('id', id)
      .single();

    if (error || !content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

// PATCH - Update content
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    // Verify ownership
    if (!(await verifyOwnership(supabase, id, userId))) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.title !== undefined) updates.title = body.title;
    if (body.content_type !== undefined) updates.content_type = body.content_type;
    if (body.document_id !== undefined) updates.document_id = body.document_id;
    if (body.runbook_id !== undefined) updates.runbook_id = body.runbook_id;
    if (body.external_url !== undefined) updates.external_url = body.external_url;
    if (body.content_data !== undefined) updates.content_data = body.content_data;
    if (body.estimated_minutes !== undefined) updates.estimated_minutes = body.estimated_minutes;
    if (body.is_required !== undefined) updates.is_required = body.is_required;
    if (body.sort_order !== undefined) updates.sort_order = body.sort_order;

    const { data: content, error } = await supabase
      .from('training_content')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}

// DELETE - Delete content
export async function DELETE(
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

    // Verify ownership
    if (!(await verifyOwnership(supabase, id, userId))) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('training_content')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
  }
}
