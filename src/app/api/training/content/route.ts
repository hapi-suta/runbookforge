import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// POST - Create new content item
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { batch_id, section_id, title, content_type, runbook_id, document_id, external_url, generated_content } = body;

    if (!batch_id || !title || !content_type) {
      return NextResponse.json({ error: 'batch_id, title, and content_type required' }, { status: 400 });
    }

    // Verify batch ownership
    const { data: batch } = await supabase
      .from('training_batches')
      .select('id')
      .eq('id', batch_id)
      .eq('user_id', userId)
      .single();

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Get or create module for section
    let moduleId: string;
    
    if (section_id) {
      const { data: existingModule } = await supabase
        .from('training_modules')
        .select('id')
        .eq('batch_id', batch_id)
        .eq('section_id', section_id)
        .single();

      if (existingModule) {
        moduleId = existingModule.id;
      } else {
        const { data: section } = await supabase
          .from('training_sections')
          .select('title')
          .eq('id', section_id)
          .single();

        const { data: newModule, error: moduleError } = await supabase
          .from('training_modules')
          .insert({ batch_id, section_id, title: section?.title || 'Content', is_published: true })
          .select()
          .single();

        if (moduleError) throw moduleError;
        moduleId = newModule.id;
      }
    } else {
      const { data: newModule, error: moduleError } = await supabase
        .from('training_modules')
        .insert({ batch_id, title: 'Content', is_published: true })
        .select()
        .single();

      if (moduleError) throw moduleError;
      moduleId = newModule.id;
    }

    const { data: content, error } = await supabase
      .from('training_content')
      .insert({
        module_id: moduleId,
        title,
        content_type,
        runbook_id: runbook_id || null,
        document_id: document_id || null,
        external_url: external_url || null,
        generated_content: generated_content || null
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
