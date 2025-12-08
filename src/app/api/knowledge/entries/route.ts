import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET - List KB entries
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const mySubmissions = searchParams.get('my_submissions');

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('kb_entries')
      .select(`
        *,
        kb_categories (id, name, slug, icon),
        runbooks (id, title, description),
        documents (id, title, description, file_type)
      `)
      .order('submitted_at', { ascending: false });

    if (mySubmissions === 'true') {
      const { userId } = await auth();
      if (userId) query = query.eq('submitted_by', userId);
    } else {
      query = query.eq('status', 'approved');
    }

    if (category) query = query.eq('category_id', category);
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

// POST - Submit new KB entry
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { title, description, category_id, runbook_id, document_id, difficulty, tags } = body;

    if (!title || !category_id) {
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('kb_entries')
      .insert({
        title,
        description: description || '',
        category_id,
        runbook_id: runbook_id || null,
        document_id: document_id || null,
        difficulty: difficulty || 'intermediate',
        tags: tags || [],
        submitted_by: userId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}
