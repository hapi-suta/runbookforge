import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - Look up enrollment by access code and email
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const email = searchParams.get('email');

    if (!code || !email) {
      return NextResponse.json({ error: 'Code and email required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Find batch by access code
    const { data: batch } = await supabase
      .from('training_batches')
      .select('id, status')
      .eq('access_code', code)
      .single();

    if (!batch) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 });
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
