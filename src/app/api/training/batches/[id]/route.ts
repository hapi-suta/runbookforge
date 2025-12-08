import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Try to fetch with sections first
    let batch;
    let error;

    ({ data: batch, error } = await supabase
      .from('training_batches')
      .select(`
        *,
        training_sections (
          *
        ),
        training_modules (
          *,
          training_content (
            *,
            documents (id, title, file_type),
            runbooks (id, title)
          )
        ),
        training_enrollments (
          id, student_email, student_name, status, enrolled_at, last_accessed_at
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single());

    // If sections table doesn't exist, try without it
    if (error && error.message.includes('training_sections')) {
      ({ data: batch, error } = await supabase
        .from('training_batches')
        .select(`
          *,
          training_modules (
            *,
            training_content (
              *,
              documents (id, title, file_type),
              runbooks (id, title)
            )
          ),
          training_enrollments (
            id, student_email, student_name, status, enrolled_at, last_accessed_at
          )
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single());
      
      // Add empty sections array
      if (batch) {
        batch.training_sections = [];
      }
    }

    if (error) throw error;
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Sort sections
    if (batch.training_sections) {
      batch.training_sections.sort((a: { sort_order: number }, b: { sort_order: number }) => 
        a.sort_order - b.sort_order
      );
    }

    // Sort modules and nest under sections
    if (batch.training_modules) {
      batch.training_modules.sort((a: { sort_order: number }, b: { sort_order: number }) => 
        a.sort_order - b.sort_order
      );
      
      batch.training_modules.forEach((module: { training_content: { sort_order: number }[] }) => {
        if (module.training_content) {
          module.training_content.sort((a: { sort_order: number }, b: { sort_order: number }) => 
            a.sort_order - b.sort_order
          );
        }
      });
    }

    return NextResponse.json(batch);
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
    const body = await request.json();
    const { title, description, status, settings } = body;

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
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (settings !== undefined) updateData.settings = settings;

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

    const { data: existing } = await supabase
      .from('training_batches')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('training_batches')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting batch:', error);
    return NextResponse.json({ error: 'Failed to delete batch' }, { status: 500 });
  }
}
