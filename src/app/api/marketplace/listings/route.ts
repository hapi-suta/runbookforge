import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Browse marketplace listings
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'popular';
    const featured = searchParams.get('featured');
    const creatorId = searchParams.get('creator_id');

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
      `);

    // Filter by status (only approved for public, or creator's own)
    if (creatorId) {
      query = query.eq('creator_id', creatorId);
    } else {
      query = query.eq('status', 'approved');
    }

    // Filter by category
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    // Filter by featured
    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    // Search
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sort
    switch (sort) {
      case 'popular':
        query = query.order('sales_count', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'price_low':
        query = query.order('price_personal', { ascending: true });
        break;
      case 'price_high':
        query = query.order('price_personal', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating_count', { ascending: false });
        break;
      default:
        query = query.order('sales_count', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching listings:', error);
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }

    // Calculate average rating for each listing
    const listingsWithRating = data?.map(listing => ({
      ...listing,
      rating: listing.rating_count > 0 
        ? (listing.rating_sum / listing.rating_count).toFixed(1) 
        : null
    }));

    return NextResponse.json(listingsWithRating || []);
  } catch (error) {
    console.error('Error in GET /api/marketplace/listings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new listing (submit runbook for sale)
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      runbook_id, 
      price_personal, 
      category, 
      tags = [],
      description 
    } = body;

    if (!runbook_id || !price_personal || !category) {
      return NextResponse.json({ 
        error: 'Missing required fields: runbook_id, price_personal, category' 
      }, { status: 400 });
    }

    // Verify the runbook belongs to this user
    const { data: runbook, error: runbookError } = await supabase
      .from('runbooks')
      .select('*')
      .eq('id', runbook_id)
      .eq('user_id', userId)
      .single();

    if (runbookError || !runbook) {
      return NextResponse.json({ error: 'Runbook not found or not owned by you' }, { status: 404 });
    }

    // Check if listing already exists for this runbook
    const { data: existingListing } = await supabase
      .from('marketplace_listings')
      .select('id')
      .eq('runbook_id', runbook_id)
      .single();

    if (existingListing) {
      return NextResponse.json({ error: 'This runbook is already listed' }, { status: 400 });
    }

    // Calculate team and enterprise prices
    const pricePersonal = Math.round(price_personal * 100); // Convert to cents
    const priceTeam = pricePersonal * 3;
    const priceEnterprise = pricePersonal * 10;

    // Create preview content (first section)
    const previewContent = runbook.sections?.[0] || null;

    // Create the listing
    const { data: listing, error: createError } = await supabase
      .from('marketplace_listings')
      .insert({
        runbook_id,
        creator_id: userId,
        title: runbook.title,
        description: description || runbook.description,
        price_personal: pricePersonal,
        price_team: priceTeam,
        price_enterprise: priceEnterprise,
        category,
        tags,
        status: 'pending', // Requires admin approval
        preview_content: previewContent
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating listing:', createError);
      return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
    }

    // Ensure creator account exists
    const { data: creatorAccount } = await supabase
      .from('creator_accounts')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!creatorAccount) {
      await supabase
        .from('creator_accounts')
        .insert({
          user_id: userId,
          stripe_account_status: 'pending',
          payouts_enabled: false
        });
    }

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/marketplace/listings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
