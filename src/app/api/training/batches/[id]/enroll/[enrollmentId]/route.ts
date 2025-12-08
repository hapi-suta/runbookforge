import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Prevent static rendering - this route uses auth headers
export const dynamic = 'force-dynamic';

// DELETE - Remove enrollment
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; enrollmentId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, enrollmentId } = await params;
    const supabase = getSupabaseAdmin();

    const { data: batch } = await supabase
      .from('training_batches')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('training_enrollments')
      .delete()
      .eq('id', enrollmentId)
      .eq('batch_id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing enrollment:', error);
    return NextResponse.json({ error: 'Failed to remove enrollment' }, { status: 500 });
  }
}
