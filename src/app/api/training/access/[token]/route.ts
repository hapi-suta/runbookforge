import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET - Validate access token and get training content
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = getSupabaseAdmin();

    // Find enrollment by access token
    const { data: enrollment, error } = await supabase
      .from('training_enrollments')
      .select(`
        *,
        training_batches (
          id, title, description, status,
          training_sections (*),
          training_modules (*, training_content (*))
        )
      `)
      .eq('access_token', token)
      .eq('status', 'active')
      .single();

    if (error || !enrollment) {
      return NextResponse.json({ error: 'Invalid or expired access token' }, { status: 404 });
    }

    if (enrollment.training_batches.status !== 'active') {
      return NextResponse.json({ error: 'This training is not currently available' }, { status: 403 });
    }

    // Update last accessed
    await supabase
      .from('training_enrollments')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', enrollment.id);

    // Get progress
    const { data: progress } = await supabase
      .from('training_progress')
      .select('*')
      .eq('enrollment_id', enrollment.id);

    return NextResponse.json({
      enrollment: {
        id: enrollment.id,
        student_email: enrollment.student_email,
        student_name: enrollment.student_name
      },
      batch: enrollment.training_batches,
      progress: progress || []
    });
  } catch (error) {
    console.error('Error validating access:', error);
    return NextResponse.json({ error: 'Failed to validate access' }, { status: 500 });
  }
}

// POST - Update progress
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = getSupabaseAdmin();
    const { content_id, completed } = await request.json();

    const { data: enrollment } = await supabase
      .from('training_enrollments')
      .select('id')
      .eq('access_token', token)
      .eq('status', 'active')
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('training_progress')
      .upsert({
        enrollment_id: enrollment.id,
        content_id,
        completed,
        completed_at: completed ? new Date().toISOString() : null
      }, { onConflict: 'enrollment_id,content_id' })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
