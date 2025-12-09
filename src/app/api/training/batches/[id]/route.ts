import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - Get batch with all related data
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

    // Get batch
    const { data: batch, error: batchError } = await supabase
      .from('training_batches')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Get sections
    const { data: sections } = await supabase
      .from('training_sections')
      .select('*')
      .eq('batch_id', id)
      .order('sort_order');

    // Get modules with content
    const { data: modules } = await supabase
      .from('training_modules')
      .select(`
        *,
        training_content (
          *,
          documents (id, title),
          runbooks (id, title)
        )
      `)
      .eq('batch_id', id)
      .order('sort_order');

    // Get enrollments
    const { data: enrollments } = await supabase
      .from('training_enrollments')
      .select('*')
      .eq('batch_id', id)
      .order('enrolled_at', { ascending: false });

    return NextResponse.json({
      ...batch,
      training_sections: sections || [],
      training_modules: (modules || []).map(m => ({
        ...m,
        training_content: m.training_content || []
      })),
      training_enrollments: enrollments || []
    });
  } catch (error) {
    console.error('Error fetching batch:', error);
    return NextResponse.json({ error: 'Failed to fetch batch' }, { status: 500 });
  }
}

// PATCH - Update batch
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
    const { data: existing } = await supabase
      .from('training_batches')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.status !== undefined) updates.status = body.status;
    if (body.settings !== undefined) updates.settings = body.settings;
    if (body.cover_image !== undefined) updates.cover_image = body.cover_image;

    const { data: batch, error } = await supabase
      .from('training_batches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(batch);
  } catch (error) {
    console.error('Error updating batch:', error);
    return NextResponse.json({ error: 'Failed to update batch' }, { status: 500 });
  }
}

// DELETE - Delete batch (cascades to all related data)
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

    const { error } = await supabase
      .from('training_batches')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting batch:', error);
    return NextResponse.json({ error: 'Failed to delete batch' }, { status: 500 });
  }
}
