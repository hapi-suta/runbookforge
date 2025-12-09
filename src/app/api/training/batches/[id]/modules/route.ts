import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// POST - Create module in section
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: batchId } = await params;
    const body = await request.json();
    const { section_id, title, description } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Verify batch ownership
    const { data: batch } = await supabase
      .from('training_batches')
      .select('id')
      .eq('id', batchId)
      .eq('user_id', userId)
      .single();

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Get max sort order for section
    const { data: existing } = await supabase
      .from('training_modules')
      .select('sort_order')
      .eq('batch_id', batchId)
      .eq('section_id', section_id)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

    // Create module
    const { data: module, error } = await supabase
      .from('training_modules')
      .insert({
        batch_id: batchId,
        section_id: section_id || null,
        title: title.trim(),
        description: description?.trim() || null,
        sort_order: nextOrder
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    console.error('Error creating module:', error);
    return NextResponse.json({ error: 'Failed to create module' }, { status: 500 });
  }
}

// PATCH - Update module
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: batchId } = await params;
    const body = await request.json();
    const { module_id, title, description, is_published, sort_order, section_id } = body;

    if (!module_id) {
      return NextResponse.json({ error: 'Module ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Verify batch ownership
    const { data: batch } = await supabase
      .from('training_batches')
      .select('id')
      .eq('id', batchId)
      .eq('user_id', userId)
      .single();

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (is_published !== undefined) updates.is_published = is_published;
    if (sort_order !== undefined) updates.sort_order = sort_order;
    if (section_id !== undefined) updates.section_id = section_id;

    const { data: module, error } = await supabase
      .from('training_modules')
      .update(updates)
      .eq('id', module_id)
      .eq('batch_id', batchId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(module);
  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json({ error: 'Failed to update module' }, { status: 500 });
  }
}

// DELETE - Delete module
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: batchId } = await params;
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('module_id');

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Verify batch ownership
    const { data: batch } = await supabase
      .from('training_batches')
      .select('id')
      .eq('id', batchId)
      .eq('user_id', userId)
      .single();

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('training_modules')
      .delete()
      .eq('id', moduleId)
      .eq('batch_id', batchId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 });
  }
}
