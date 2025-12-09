import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

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

    const { id: batchId, enrollmentId } = await params;
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
      .from('training_enrollments')
      .delete()
      .eq('id', enrollmentId)
      .eq('batch_id', batchId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing enrollment:', error);
    return NextResponse.json({ error: 'Failed to remove enrollment' }, { status: 500 });
  }
}

// PATCH - Update enrollment status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; enrollmentId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: batchId, enrollmentId } = await params;
    const body = await request.json();
    const { status, student_name } = body;

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

    const updates: Record<string, unknown> = {};
    if (status !== undefined) updates.status = status;
    if (student_name !== undefined) updates.student_name = student_name;

    const { data: enrollment, error } = await supabase
      .from('training_enrollments')
      .update(updates)
      .eq('id', enrollmentId)
      .eq('batch_id', batchId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(enrollment);
  } catch (error) {
    console.error('Error updating enrollment:', error);
    return NextResponse.json({ error: 'Failed to update enrollment' }, { status: 500 });
  }
}
