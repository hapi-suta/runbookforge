import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Prevent static rendering - this route uses auth headers
export const dynamic = 'force-dynamic';

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
    const supabase = getSupabaseAdmin();

    // Get content with module and batch to verify ownership
    const { data: content } = await supabase
      .from('training_content')
      .select('id, training_modules!inner(batch_id, training_batches!inner(user_id))')
      .eq('id', id)
      .single();

    if (!content) {
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
