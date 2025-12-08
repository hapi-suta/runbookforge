import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - List knowledge base entries (public) or with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const difficulty = searchParams.get('difficulty');
    const status = searchParams.get('status') || 'approved';
    const mySubmissions = searchParams.get('my') === 'true';

    let query = supabase
      .from('kb_entries')
      .select(`
        *,
        kb_categories (id, name, slug, icon),
        runbooks (id, title, description),
        documents (id, title, description, file_type)
      `)
      .order('helpful_count', { ascending: false });

    // If viewing own submissions, require auth
    if (mySubmissions) {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      query = query.eq('user_id', userId);
    } else {
      // Public view - only approved entries
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category_id', category);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: entries, error } = await query.limit(50);

    if (error) throw error;

    return NextResponse.json(entries || []);
  } catch (error) {
    console.error('Error fetching KB entries:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

// POST - Submit new entry to knowledge base
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category_id, runbook_id, document_id, tags, difficulty } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!runbook_id && !document_id) {
      return NextResponse.json({ error: 'Either runbook or document is required' }, { status: 400 });
    }

    // Verify ownership of runbook/document
    if (runbook_id) {
      const { data: runbook } = await supabase
        .from('runbooks')
        .select('id')
        .eq('id', runbook_id)
        .eq('user_id', userId)
        .single();
      
      if (!runbook) {
        return NextResponse.json({ error: 'Runbook not found or not owned' }, { status: 404 });
      }
    }

    if (document_id) {
      const { data: doc } = await supabase
        .from('documents')
        .select('id')
        .eq('id', document_id)
        .eq('user_id', userId)
        .single();
      
      if (!doc) {
        return NextResponse.json({ error: 'Document not found or not owned' }, { status: 404 });
      }
    }

    const { data: entry, error } = await supabase
      .from('kb_entries')
      .insert({
        user_id: userId,
        title,
        description,
        category_id,
        runbook_id,
        document_id,
        tags: tags || [],
        difficulty: difficulty || 'intermediate',
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error submitting KB entry:', error);
    return NextResponse.json({ error: 'Failed to submit entry' }, { status: 500 });
  }
}
