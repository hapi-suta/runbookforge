import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Prevent static rendering - this route uses auth headers
export const dynamic = 'force-dynamic';

// GET - Browse marketplace listings
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'popular';
    const featured = searchParams.get('featured');
    const creatorId = searchParams.get('creator_id');

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('marketplace_listings')
      .select(`
        *,
        runbooks (
          id,
          title,
          description,
          sections
        )
      `)
      .eq('status', 'approved');

    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${search}%`);
    if (featured === 'true') query = query.eq('featured', true);
    if (creatorId) query = query.eq('seller_id', creatorId);

    switch (sort) {
      case 'newest': query = query.order('created_at', { ascending: false }); break;
      case 'price_low': query = query.order('price', { ascending: true }); break;
      case 'price_high': query = query.order('price', { ascending: false }); break;
      default: query = query.order('download_count', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

// POST - Create a new listing
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { runbook_id, title, description, price, category, preview_sections, tags } = body;

    if (!runbook_id) {
      return NextResponse.json({ error: 'runbook_id is required' }, { status: 400 });
    }

    // Verify ownership and get runbook details
    const { data: runbook } = await supabase
      .from('runbooks')
      .select('id, title, description')
      .eq('id', runbook_id)
      .eq('user_id', userId)
      .single();

    if (!runbook) {
      return NextResponse.json({ error: 'Runbook not found' }, { status: 404 });
    }

    // Use provided title or fallback to runbook title
    const listingTitle = title || runbook.title;
    if (!listingTitle) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('marketplace_listings')
      .insert({
        seller_id: userId,
        runbook_id,
        title: listingTitle,
        description: description || runbook.description || '',
        price: price || 0,
        category: category || 'other',
        preview_sections: preview_sections || [],
        tags: tags || [],
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}
