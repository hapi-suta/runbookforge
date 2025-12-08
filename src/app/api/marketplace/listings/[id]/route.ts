import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Get single listing details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: listing, error } = await supabase
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
      .eq('id', params.id)
      .single();

    if (error || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Get reviews for this listing
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('listing_id', params.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate average rating
    const rating = listing.rating_count > 0 
      ? (listing.rating_sum / listing.rating_count).toFixed(1) 
      : null;

    return NextResponse.json({
      ...listing,
      rating,
      reviews: reviews || []
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update listing (creator only)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: listing } = await supabase
      .from('marketplace_listings')
      .select('creator_id')
      .eq('id', params.id)
      .single();

    if (!listing || listing.creator_id !== userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json();
    const { price_personal, category, tags, description, status } = body;

    const updates: any = { updated_at: new Date().toISOString() };
    
    if (price_personal !== undefined) {
      updates.price_personal = Math.round(price_personal * 100);
      updates.price_team = updates.price_personal * 3;
      updates.price_enterprise = updates.price_personal * 10;
    }
    if (category) updates.category = category;
    if (tags) updates.tags = tags;
    if (description !== undefined) updates.description = description;
    if (status === 'archived') updates.status = 'archived'; // Creator can only archive

    const { data, error } = await supabase
      .from('marketplace_listings')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove listing (creator only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: listing } = await supabase
      .from('marketplace_listings')
      .select('creator_id, sales_count')
      .eq('id', params.id)
      .single();

    if (!listing || listing.creator_id !== userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Don't allow deletion if there are sales (archive instead)
    if (listing.sales_count > 0) {
      await supabase
        .from('marketplace_listings')
        .update({ status: 'archived' })
        .eq('id', params.id);
      
      return NextResponse.json({ message: 'Listing archived (has sales)' });
    }

    const { error } = await supabase
      .from('marketplace_listings')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
