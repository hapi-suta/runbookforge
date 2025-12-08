import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// GET - Get reviews for a listing
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listing_id');

    if (!listingId) {
      return NextResponse.json({ error: 'listing_id required' }, { status: 400 });
    }

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    return NextResponse.json(reviews || []);
  } catch (error) {
    console.error('Error in GET /api/marketplace/reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a review
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { listing_id, rating, comment } = body;

    if (!listing_id || !rating) {
      return NextResponse.json({ error: 'listing_id and rating required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Verify user has purchased this listing
    const { data: purchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('buyer_id', userId)
      .eq('listing_id', listing_id)
      .single();

    if (!purchase) {
      return NextResponse.json({ error: 'You must purchase this runbook before reviewing' }, { status: 403 });
    }

    // Check if already reviewed
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('listing_id', listing_id)
      .eq('buyer_id', userId)
      .single();

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this runbook' }, { status: 400 });
    }

    // Create the review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        listing_id,
        buyer_id: userId,
        purchase_id: purchase.id,
        rating,
        comment: comment || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/marketplace/reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
