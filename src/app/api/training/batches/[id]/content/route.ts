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

// POST - Add content to module
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
    const { 
      moduleId, 
      title, 
      content_type, 
      document_id, 
      runbook_id, 
      external_url, 
      text_content,
      estimated_duration,
      is_required 
    } = body;

    if (!moduleId || !title || !content_type) {
      return NextResponse.json({ error: 'Module ID, title, and content type are required' }, { status: 400 });
    }

    // Verify batch ownership
    if (!(await verifyBatchOwnership(batchId, userId))) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Verify module belongs to batch
    const { data: module } = await supabase
      .from('training_modules')
      .select('id')
      .eq('id', moduleId)
      .eq('batch_id', batchId)
      .single();

    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Get next sort order
    const { data: lastContent } = await supabase
      .from('training_content')
      .select('sort_order')
      .eq('module_id', moduleId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const sortOrder = (lastContent?.sort_order || 0) + 1;

    const { data: content, error } = await supabase
      .from('training_content')
      .insert({
        module_id: moduleId,
        title,
        content_type,
        document_id: document_id || null,
        runbook_id: runbook_id || null,
        external_url: external_url || null,
        text_content: text_content || null,
        estimated_duration: estimated_duration || null,
        is_required: is_required || false,
        sort_order: sortOrder
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error('Error adding content:', error);
    return NextResponse.json({ error: 'Failed to add content' }, { status: 500 });
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

    const { id: batchId } = await params;
    const body = await request.json();
    const { contentId, title, sort_order, is_required, estimated_duration } = body;

    if (!contentId) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    // Verify batch ownership
    if (!(await verifyBatchOwnership(batchId, userId))) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    if (is_required !== undefined) updateData.is_required = is_required;
    if (estimated_duration !== undefined) updateData.estimated_duration = estimated_duration;

    const { data: content, error } = await supabase
      .from('training_content')
      .update(updateData)
      .eq('id', contentId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}

// DELETE - Remove content
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
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    // Verify batch ownership
    if (!(await verifyBatchOwnership(batchId, userId))) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('training_content')
      .delete()
      .eq('id', contentId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
  }
}
