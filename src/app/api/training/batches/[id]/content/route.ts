import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// POST - Add content or folder to a module
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
    
    console.log('Creating content - received body:', JSON.stringify({
      section_id: body.section_id,
      module_id: body.module_id,
      title: body.title,
      content_type: body.content_type,
      is_folder: body.is_folder,
      has_content_data: !!body.content_data
    }));
    
    const { 
      section_id, 
      module_id,
      parent_id,        // For nested folders
      title, 
      content_type, 
      document_id, 
      runbook_id, 
      external_url,
      content_data,
      estimated_minutes,
      is_required,
      is_folder,        // Create a folder instead of content
      description,
      icon,
      color
    } = body;

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

    // If creating a folder (module)
    if (is_folder) {
      if (!title?.trim()) {
        return NextResponse.json({ error: 'Title required for folder' }, { status: 400 });
      }

      // Get max sort order for modules
      const sortQuery = parent_id 
        ? supabase.from('training_modules').select('sort_order').eq('parent_id', parent_id)
        : supabase.from('training_modules').select('sort_order').eq('section_id', section_id).is('parent_id', null);
      
      const { data: existingModules } = await sortQuery.order('sort_order', { ascending: false }).limit(1);
      const nextOrder = (existingModules?.[0]?.sort_order ?? -1) + 1;

      const { data: folder, error: folderError } = await supabase
        .from('training_modules')
        .insert({
          batch_id: batchId,
          section_id: section_id || null,
          parent_id: parent_id || null,
          title: title.trim(),
          description: description || null,
          is_folder: true,
          icon: icon || null,
          color: color || 'slate',
          sort_order: nextOrder,
          is_published: true
        })
        .select()
        .single();

      if (folderError) throw folderError;
      return NextResponse.json(folder, { status: 201 });
    }

    // Creating content - need a module
    if (!title?.trim() || !content_type) {
      return NextResponse.json({ error: 'Title and content type required' }, { status: 400 });
    }

    // Handle empty string module_id as undefined
    let targetModuleId = module_id && module_id.trim() ? module_id : undefined;

    // If no module_id but section_id provided, create or find a default module
    if (!targetModuleId && section_id) {
      console.log('No module_id, looking for module in section:', section_id);
      
      // Look for existing module in section
      const { data: existingModule, error: findError } = await supabase
        .from('training_modules')
        .select('id')
        .eq('batch_id', batchId)
        .eq('section_id', section_id)
        .is('parent_id', null)
        .order('sort_order')
        .limit(1)
        .single();

      if (findError) {
        console.log('No existing module found, will create one. Error:', findError.message);
      }

      if (existingModule) {
        console.log('Found existing module:', existingModule.id);
        targetModuleId = existingModule.id;
      } else {
        // Get section title for module name
        const { data: section } = await supabase
          .from('training_sections')
          .select('title')
          .eq('id', section_id)
          .single();

        console.log('Creating new module for section:', section?.title || 'Unknown');

        // Create new module
        const { data: newModule, error: moduleError } = await supabase
          .from('training_modules')
          .insert({
            batch_id: batchId,
            section_id: section_id,
            title: `${section?.title || 'Module'} Content`,
            sort_order: 0,
            is_folder: true,
            is_published: true
          })
          .select()
          .single();

        if (moduleError) {
          console.error('Error creating module:', moduleError);
          return NextResponse.json({ 
            error: 'Failed to create module', 
            details: moduleError.message 
          }, { status: 500 });
        }
        
        console.log('Created new module:', newModule.id);
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
        description: description || null,
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

    if (error) {
      console.error('Supabase error creating content:', error);
      return NextResponse.json({ 
        error: 'Failed to create content', 
        details: error.message || JSON.stringify(error)
      }, { status: 500 });
    }
    
    console.log('Content created successfully:', content?.id);
    return NextResponse.json(content, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating content:', error);
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'object' && error !== null) {
      message = JSON.stringify(error);
    } else if (typeof error === 'string') {
      message = error;
    }
    return NextResponse.json({ error: 'Failed to create content', details: message }, { status: 500 });
  }
}
