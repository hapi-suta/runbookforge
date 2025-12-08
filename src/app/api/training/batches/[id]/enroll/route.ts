import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    const body = await request.json();
    const { emails } = body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Emails array is required' }, { status: 400 });
    }

    // Verify batch ownership
    const { data: batch } = await supabase
      .from('training_batches')
      .select('id, title')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Create enrollments
    const enrollments = emails.map((email: string) => ({
      batch_id: id,
      student_email: email.toLowerCase().trim(),
      access_token: generateToken(),
      status: 'active'
    }));

    const { data: created, error } = await supabase
      .from('training_enrollments')
      .upsert(enrollments, { 
        onConflict: 'batch_id,student_email',
        ignoreDuplicates: true 
      })
      .select();

    if (error) throw error;

    // TODO: Send email notifications to enrolled students

    return NextResponse.json({
      enrolled: created?.length || 0,
      message: `Successfully enrolled ${created?.length || 0} student(s)`
    }, { status: 201 });
  } catch (error) {
    console.error('Error enrolling students:', error);
    return NextResponse.json({ error: 'Failed to enroll students' }, { status: 500 });
  }
}

// GET - List enrollments
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

    // Verify batch ownership
    const { data: batch } = await supabase
      .from('training_batches')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const { data: enrollments, error } = await supabase
      .from('training_enrollments')
      .select('*')
      .eq('batch_id', id)
      .order('enrolled_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(enrollments || []);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
  }
}
