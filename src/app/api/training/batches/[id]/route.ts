import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Prevent static rendering - this route uses auth headers
export const dynamic = 'force-dynamic';

// GET - Get batch details with sections, modules, and content
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
    const supabase = getSupabaseAdmin();

    // First get the batch itself
    const { data: batch, error: batchError } = await supabase
      .from('training_batches')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (batchError) {
      console.error('Batch fetch error:', batchError);
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Get sections
    let sections: unknown[] = [];
    const { data: sectionData, error: sectionError } = await supabase
      .from('training_sections')
      .select('*')
      .eq('batch_id', id)
      .order('sort_order', { ascending: true });
    
    if (sectionError) {
      console.warn('Could not fetch sections:', sectionError.message);
    } else {
      sections = sectionData || [];
    }
    console.log('Fetched sections:', sections.length);

    // Get modules with content
    let modules: unknown[] = [];
    const { data: moduleData, error: moduleError } = await supabase
      .from('training_modules')
      .select('*, training_content (*)')
      .eq('batch_id', id)
      .order('sort_order', { ascending: true });
    
    if (moduleError) {
      console.warn('Could not fetch modules:', moduleError.message);
    } else {
      modules = (moduleData || []).map((m: Record<string, unknown>) => ({
        ...m,
        training_content: m.training_content || []
      }));
    }

    // Get enrollments
    let enrollments: unknown[] = [];
    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from('training_enrollments')
      .select('id, student_email, student_name, status, enrolled_at, access_token')
      .eq('batch_id', id);
    
    if (enrollmentError) {
      console.warn('Could not fetch enrollments:', enrollmentError.message);
    } else {
      enrollments = enrollmentData || [];
    }

    return NextResponse.json({
      ...batch,
      training_sections: sections,
      training_modules: modules,
      training_enrollments: enrollments
    });
  } catch (error) {
    console.error('Error fetching batch:', error);
    return NextResponse.json({ error: 'Failed to fetch batch' }, { status: 500 });
  }
}

// PATCH - Update batch
export async function PATCH(
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
    const body = await request.json();

    const { data: existing } = await supabase
      .from('training_batches')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.settings !== undefined) updateData.settings = body.settings;

    const { data: batch, error } = await supabase
      .from('training_batches')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(batch);
  } catch (error) {
    console.error('Error updating batch:', error);
    return NextResponse.json({ error: 'Failed to update batch' }, { status: 500 });
  }
}

// DELETE - Delete batch
export async function DELETE(
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

    const { error } = await supabase
      .from('training_batches')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting batch:', error);
    return NextResponse.json({ error: 'Failed to delete batch' }, { status: 500 });
  }
}
