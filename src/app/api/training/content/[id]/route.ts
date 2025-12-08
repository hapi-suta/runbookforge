import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// DELETE - Delete content item
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

    // Get content with module and batch to verify ownership
    const { data: content } = await supabase
      .from('training_content')
      .select(`
        id,
        training_modules!inner (
          batch_id,
          training_batches!inner (
            user_id
          )
        )
      `)
      .eq('id', id)
      .single();

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Type assertion for nested query result
    const module = content.training_modules as unknown as { 
      batch_id: string; 
      training_batches: { user_id: string } 
    };

    if (module.training_batches.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
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

// PATCH - Update content item
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

    // Verify ownership (same as delete)
    const { data: content } = await supabase
      .from('training_content')
      .select(`
        id,
        training_modules!inner (
          batch_id,
          training_batches!inner (
            user_id
          )
        )
      `)
      .eq('id', id)
      .single();

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    const module = content.training_modules as unknown as { 
      batch_id: string; 
      training_batches: { user_id: string } 
    };

    if (module.training_batches.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.external_url !== undefined) updateData.external_url = body.external_url;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;

    const { data: updated, error } = await supabase
      .from('training_content')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}
