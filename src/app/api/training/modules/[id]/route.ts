import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET - Get module details
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

    const { data: module, error } = await supabase
      .from('training_modules')
      .select(`
        *,
        training_content (*),
        training_batches!inner (user_id)
      `)
      .eq('id', id)
      .single();

    if (error || !module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    if (module.training_batches.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(module);
  } catch (error) {
    console.error('Error fetching module:', error);
    return NextResponse.json({ error: 'Failed to fetch module' }, { status: 500 });
  }
}

// PATCH - Update module
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
    const supabase = getSupabaseAdmin();

    // Verify ownership
    const { data: existing } = await supabase
      .from('training_modules')
      .select('*, training_batches!inner (user_id)')
      .eq('id', id)
      .single();

    if (!existing || existing.training_batches.user_id !== userId) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.icon !== undefined) updates.icon = body.icon;
    if (body.color !== undefined) updates.color = body.color;
    if (body.sort_order !== undefined) updates.sort_order = body.sort_order;
    if (body.is_published !== undefined) updates.is_published = body.is_published;
    if (body.parent_id !== undefined) updates.parent_id = body.parent_id;

    const { data: module, error } = await supabase
      .from('training_modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(module);
  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json({ error: 'Failed to update module' }, { status: 500 });
  }
}

// DELETE - Delete module and all its content
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

    // Verify ownership
    const { data: existing } = await supabase
      .from('training_modules')
      .select('*, training_batches!inner (user_id)')
      .eq('id', id)
      .single();

    if (!existing || existing.training_batches.user_id !== userId) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Delete module (cascade will handle content and child modules)
    const { error } = await supabase
      .from('training_modules')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 });
  }
}

