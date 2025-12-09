import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - Access training via token (for students)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = getSupabaseAdmin();

    // Get enrollment by token
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('training_enrollments')
      .select(`
        *,
        training_batches (
          id, title, description, status, settings,
          training_sections (
            id, section_key, title, description, icon, color, sort_order, is_enabled
          )
        )
      `)
      .eq('access_token', token)
      .single();

    if (enrollmentError || !enrollment) {
      return NextResponse.json({ error: 'Invalid access token' }, { status: 404 });
    }

    if (enrollment.status === 'suspended') {
      return NextResponse.json({ error: 'Access suspended' }, { status: 403 });
    }

    const batch = enrollment.training_batches;
    if (!batch || batch.status !== 'active') {
      return NextResponse.json({ error: 'Training not available' }, { status: 404 });
    }

    // Get modules with content (including linked documents and runbooks)
    const { data: modules } = await supabase
      .from('training_modules')
      .select(`
        id, title, description, section_id, sort_order, is_published,
        training_content (
          id, title, content_type, document_id, runbook_id, external_url,
          content_data, sort_order, is_required, estimated_minutes,
          documents (id, title, metadata),
          runbooks (id, title, sections)
        )
      `)
      .eq('batch_id', batch.id)
      .eq('is_published', true)
      .order('sort_order');

    // Get student progress
    const { data: progress } = await supabase
      .from('training_progress')
      .select('content_id, status, completed_at, time_spent_seconds')
      .eq('enrollment_id', enrollment.id);

    // Update last accessed
    await supabase
      .from('training_enrollments')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', enrollment.id);

    return NextResponse.json({
      enrollment: {
        id: enrollment.id,
        student_email: enrollment.student_email,
        student_name: enrollment.student_name,
        status: enrollment.status
      },
      batch: {
        id: batch.id,
        title: batch.title,
        description: batch.description,
        settings: batch.settings,
        sections: batch.training_sections || []
      },
      modules: (modules || []).map(m => ({
        ...m,
        training_content: m.training_content || []
      })),
      progress: progress || []
    });
  } catch (error) {
    console.error('Error accessing training:', error);
    return NextResponse.json({ error: 'Failed to load training' }, { status: 500 });
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
    const { content_id, status, time_spent_seconds } = body;

    if (!content_id) {
      return NextResponse.json({ error: 'Content ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get enrollment
    const { data: enrollment } = await supabase
      .from('training_enrollments')
      .select('id, status')
      .eq('access_token', token)
      .single();

    if (!enrollment || enrollment.status !== 'active') {
      return NextResponse.json({ error: 'Invalid or suspended access' }, { status: 403 });
    }

    // Upsert progress
    const progressData: Record<string, unknown> = {
      enrollment_id: enrollment.id,
      content_id,
      status: status || 'in_progress'
    };

    if (status === 'in_progress') {
      progressData.started_at = new Date().toISOString();
    }
    if (status === 'completed') {
      progressData.completed_at = new Date().toISOString();
    }
    if (time_spent_seconds) {
      progressData.time_spent_seconds = time_spent_seconds;
    }

    const { data: progress, error } = await supabase
      .from('training_progress')
      .upsert(progressData, { onConflict: 'enrollment_id,content_id' })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
