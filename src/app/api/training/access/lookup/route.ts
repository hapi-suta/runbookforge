import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - Look up enrollment by access code and email, or preview mode
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const email = searchParams.get('email');
    const isPreview = searchParams.get('preview') === 'true';

    if (!code) {
      return NextResponse.json({ error: 'Access code required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Find batch by access code
    const { data: batch } = await supabase
      .from('training_batches')
      .select('id, title, description, status, user_id')
      .eq('access_code', code)
      .single();

    if (!batch) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 });
    }

    // Preview mode - verify batch owner
    if (isPreview) {
      const { userId } = await auth();
      if (!userId || userId !== batch.user_id) {
        return NextResponse.json({ error: 'Unauthorized - only batch owner can preview' }, { status: 403 });
      }

      // Get sections
      const { data: sections } = await supabase
        .from('training_sections')
        .select('*')
        .eq('batch_id', batch.id)
        .order('sort_order');

      // Get modules with content (including linked documents and runbooks)
      const { data: modules } = await supabase
        .from('training_modules')
        .select(`
          *,
          training_content (
            *,
            documents (id, title, metadata),
            runbooks (id, title, sections)
          )
        `)
        .eq('batch_id', batch.id)
        .order('sort_order');

      return NextResponse.json({
        enrollment: { id: 'preview', student_email: 'preview@example.com', student_name: 'Preview Mode' },
        batch: { id: batch.id, title: batch.title, description: batch.description, sections: sections || [] },
        modules: (modules || []).map(m => ({ ...m, training_content: m.training_content || [] })),
        progress: [],
        isPreview: true
      });
    }

    // Regular access - email required
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    if (batch.status !== 'active') {
      return NextResponse.json({ error: 'Training is not currently available' }, { status: 403 });
    }

    // Find enrollment by email
    const { data: enrollment, error } = await supabase
      .from('training_enrollments')
      .select('id, access_token, status')
      .eq('batch_id', batch.id)
      .eq('student_email', email.toLowerCase().trim())
      .single();

    if (error || !enrollment) {
      return NextResponse.json({ error: 'Email not enrolled in this training' }, { status: 404 });
    }

    if (enrollment.status === 'suspended') {
      return NextResponse.json({ error: 'Your access has been suspended' }, { status: 403 });
    }

    return NextResponse.json({
      access_token: enrollment.access_token
    });
  } catch (error) {
    console.error('Error looking up enrollment:', error);
    return NextResponse.json({ error: 'Failed to verify enrollment' }, { status: 500 });
  }
}

// POST - Self-register for training
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, email, name } = body;

    if (!code || !email) {
      return NextResponse.json({ error: 'Access code and email required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Find batch by access code
    const { data: batch } = await supabase
      .from('training_batches')
      .select('id, status, settings')
      .eq('access_code', code)
      .single();

    if (!batch) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 });
    }

    if (batch.status !== 'active') {
      return NextResponse.json({ error: 'Training is not currently accepting enrollments' }, { status: 403 });
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('training_enrollments')
      .select('id, access_token')
      .eq('batch_id', batch.id)
      .eq('student_email', email.toLowerCase().trim())
      .single();

    if (existing) {
      // Already enrolled, return token
      return NextResponse.json({ access_token: existing.access_token });
    }

    // Create new enrollment
    const { data: enrollment, error } = await supabase
      .from('training_enrollments')
      .insert({
        batch_id: batch.id,
        student_email: email.toLowerCase().trim(),
        student_name: name || null,
        status: 'active'
      })
      .select('access_token')
      .single();

    if (error) throw error;

    return NextResponse.json({ access_token: enrollment.access_token });
  } catch (error) {
    console.error('Error self-registering:', error);
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}
