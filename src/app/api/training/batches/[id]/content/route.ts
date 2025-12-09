import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// POST - Add content to a module (auto-creates module if section provided)
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
    const { 
      section_id, 
      module_id,
      title, 
      content_type, 
      document_id, 
      runbook_id, 
      external_url,
      content_data,
      estimated_minutes,
      is_required
    } = body;

    if (!title?.trim() || !content_type) {
      return NextResponse.json({ error: 'Title and content type required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Verify batch ownership
    const { data: batch } = await supabase
      .from('training_batches')
      .select('id')
      .eq('id', batchId)
      .eq('user_id', userId)
      .single();

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    let targetModuleId = module_id;

    // If no module_id but section_id provided, create or find a default module
    if (!targetModuleId && section_id) {
      // Look for existing module in section
      const { data: existingModule } = await supabase
        .from('training_modules')
        .select('id')
        .eq('batch_id', batchId)
        .eq('section_id', section_id)
        .order('sort_order')
        .limit(1)
        .single();

      if (existingModule) {
        targetModuleId = existingModule.id;
      } else {
        // Get section title for module name
        const { data: section } = await supabase
          .from('training_sections')
          .select('title')
          .eq('id', section_id)
          .single();

        // Create new module
        const { data: newModule, error: moduleError } = await supabase
          .from('training_modules')
          .insert({
            batch_id: batchId,
            section_id: section_id,
            title: `${section?.title || 'Module'} Content`,
            sort_order: 0
          })
          .select()
          .single();

        if (moduleError) throw moduleError;
        targetModuleId = newModule.id;
      }
    }

    if (!targetModuleId) {
      return NextResponse.json({ error: 'Module or section ID required' }, { status: 400 });
    }

    // Get max sort order
    const { data: existing } = await supabase
      .from('training_content')
      .select('sort_order')
      .eq('module_id', targetModuleId)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

    // Create content
    const { data: content, error } = await supabase
      .from('training_content')
      .insert({
        module_id: targetModuleId,
        title: title.trim(),
        content_type,
        document_id: document_id || null,
        runbook_id: runbook_id || null,
        external_url: external_url || null,
        content_data: content_data || {},
        estimated_minutes: estimated_minutes || null,
        is_required: is_required || false,
        sort_order: nextOrder
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 });
  }
}
