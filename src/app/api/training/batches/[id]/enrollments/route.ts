import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate random access token
function generateAccessToken(length = 32): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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

// GET - List enrollments for a batch
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: batchId } = await params;

    // Verify batch ownership
    if (!(await verifyBatchOwnership(batchId, userId))) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const { data: enrollments, error } = await supabase
      .from('training_enrollments')
      .select('*')
      .eq('batch_id', batchId)
      .order('enrolled_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(enrollments || []);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
  }
}

// POST - Enroll student(s)
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
    const { students } = body; // Array of { email, name }

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: 'Students array is required' }, { status: 400 });
    }

    // Verify batch ownership
    if (!(await verifyBatchOwnership(batchId, userId))) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Check for existing enrollments
    const emails = students.map((s: { email: string }) => s.email.toLowerCase());
    const { data: existing } = await supabase
      .from('training_enrollments')
      .select('student_email')
      .eq('batch_id', batchId)
      .in('student_email', emails);

    const existingEmails = new Set(existing?.map(e => e.student_email) || []);

    // Prepare new enrollments
    const newEnrollments = students
      .filter((s: { email: string }) => !existingEmails.has(s.email.toLowerCase()))
      .map((s: { email: string; name?: string }) => ({
        batch_id: batchId,
        student_email: s.email.toLowerCase(),
        student_name: s.name || null,
        access_token: generateAccessToken()
      }));

    if (newEnrollments.length === 0) {
      return NextResponse.json({ 
        message: 'All students are already enrolled',
        enrolled: 0,
        skipped: students.length 
      });
    }

    const { data: enrollments, error } = await supabase
      .from('training_enrollments')
      .insert(newEnrollments)
      .select();

    if (error) throw error;

    return NextResponse.json({
      message: `Successfully enrolled ${enrollments?.length} student(s)`,
      enrolled: enrollments?.length || 0,
      skipped: students.length - (enrollments?.length || 0),
      enrollments
    }, { status: 201 });
  } catch (error) {
    console.error('Error enrolling students:', error);
    return NextResponse.json({ error: 'Failed to enroll students' }, { status: 500 });
  }
}

// PATCH - Update enrollment status
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
    const { enrollmentId, status } = body;

    if (!enrollmentId || !status) {
      return NextResponse.json({ error: 'Enrollment ID and status are required' }, { status: 400 });
    }

    // Verify batch ownership
    if (!(await verifyBatchOwnership(batchId, userId))) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const { data: enrollment, error } = await supabase
      .from('training_enrollments')
      .update({ status })
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

// DELETE - Remove enrollment
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
    const enrollmentId = searchParams.get('enrollmentId');

    if (!enrollmentId) {
      return NextResponse.json({ error: 'Enrollment ID is required' }, { status: 400 });
    }

    // Verify batch ownership
    if (!(await verifyBatchOwnership(batchId, userId))) {
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
