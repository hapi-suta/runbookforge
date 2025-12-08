import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verify batch ownership helper
async function verifyBatchOwnership(batchId: string, userId: string) {
  const { data } = await supabase
    .from('training_batches')
    .select('id')
    .eq('id', batchId)
    .eq('user_id', userId)
    .single();
  return !!data;
}

// POST - Create new module
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
    const { title, description } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Verify batch ownership
    if (!(await verifyBatchOwnership(batchId, userId))) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Get next sort order
    const { data: lastModule } = await supabase
      .from('training_modules')
      .select('sort_order')
      .eq('batch_id', batchId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const sortOrder = (lastModule?.sort_order || 0) + 1;

    const { data: module, error } = await supabase
      .from('training_modules')
      .insert({
        batch_id: batchId,
        title,
        description,
        sort_order: sortOrder
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

// PATCH - Update module (for reordering, updating, etc.)
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
    const { moduleId, title, description, sort_order, is_published } = body;

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 });
    }

    // Verify batch ownership
    if (!(await verifyBatchOwnership(batchId, userId))) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    if (is_published !== undefined) updateData.is_published = is_published;

    const { data: module, error } = await supabase
      .from('training_modules')
      .update(updateData)
      .eq('id', moduleId)
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
    const moduleId = searchParams.get('moduleId');

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 });
    }

    // Verify batch ownership
    if (!(await verifyBatchOwnership(batchId, userId))) {
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
