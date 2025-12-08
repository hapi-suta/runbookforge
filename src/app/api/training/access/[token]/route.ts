import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Access training content via access token (no auth required)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find enrollment by access token
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('training_enrollments')
      .select(`
        *,
        training_batches (
          id,
          title,
          description,
          settings,
          status,
          training_modules (
            id,
            title,
            description,
            sort_order,
            is_published,
            training_content (
              id,
              title,
              content_type,
              document_id,
              runbook_id,
              external_url,
              sort_order,
              estimated_duration,
              is_required
            )
          )
        )
      `)
      .eq('access_token', token)
      .eq('status', 'active')
      .single();

    if (enrollmentError || !enrollment) {
      return NextResponse.json({ error: 'Invalid or expired access link' }, { status: 404 });
    }

    const batch = enrollment.training_batches;
    
    // Check if batch is active
    if (batch.status !== 'active') {
      return NextResponse.json({ error: 'This training is not currently available' }, { status: 403 });
    }

    // Update last accessed timestamp
    await supabase
      .from('training_enrollments')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', enrollment.id);

    // Filter to only published modules and sort
    const modules = (batch.training_modules || [])
      .filter((m: { is_published: boolean }) => m.is_published)
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map((module: { training_content: { sort_order: number }[] }) => ({
        ...module,
        training_content: (module.training_content || [])
          .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      }));

    // Get progress for this enrollment
    const { data: progress } = await supabase
      .from('training_progress')
      .select('content_id, status, completed_at')
      .eq('enrollment_id', enrollment.id);

    const progressMap = new Map(progress?.map(p => [p.content_id, p]) || []);

    return NextResponse.json({
      enrollment: {
        id: enrollment.id,
        student_name: enrollment.student_name,
        student_email: enrollment.student_email,
        enrolled_at: enrollment.enrolled_at
      },
      batch: {
        id: batch.id,
        title: batch.title,
        description: batch.description,
        settings: batch.settings
      },
      modules,
      progress: Object.fromEntries(progressMap)
    });
  } catch (error) {
    console.error('Error accessing training:', error);
    return NextResponse.json({ error: 'Failed to access training' }, { status: 500 });
  }
}

// POST - Update progress
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { contentId, status } = body;

    if (!contentId || !status) {
      return NextResponse.json({ error: 'Content ID and status are required' }, { status: 400 });
    }

    // Verify enrollment
    const { data: enrollment } = await supabase
      .from('training_enrollments')
      .select('id')
      .eq('access_token', token)
      .eq('status', 'active')
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: 'Invalid access' }, { status: 403 });
    }

    // Upsert progress
    const { data: progress, error } = await supabase
      .from('training_progress')
      .upsert({
        enrollment_id: enrollment.id,
        content_id: contentId,
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      }, {
        onConflict: 'enrollment_id,content_id'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
