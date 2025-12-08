import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { randomBytes } from 'crypto';

// Prevent static rendering - this route uses auth headers
export const dynamic = 'force-dynamic';

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// POST - Enroll students
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
    const { emails } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Emails array required' }, { status: 400 });
    }

    const { data: batch } = await supabase
      .from('training_batches')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const enrollments = emails.map((email: string) => ({
      batch_id: id,
      student_email: email.toLowerCase().trim(),
      access_token: generateToken(),
      status: 'active'
    }));

    const { data: created, error } = await supabase
      .from('training_enrollments')
      .upsert(enrollments, { onConflict: 'batch_id,student_email', ignoreDuplicates: true })
      .select();

    if (error) throw error;

    return NextResponse.json({ enrolled: created?.length || 0 }, { status: 201 });
  } catch (error) {
    console.error('Error enrolling students:', error);
    return NextResponse.json({ error: 'Failed to enroll students' }, { status: 500 });
  }
}
