import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST - Purchase a runbook
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { listing_id, license_type = 'personal' } = body;

    if (!listing_id) {
      return NextResponse.json({ error: 'Missing listing_id' }, { status: 400 });
    }

    // Get the listing
    const { data: listing, error: listingError } = await supabase
      .from('marketplace_listings')
      .select('*, runbooks(*)')
      .eq('id', listing_id)
      .eq('status', 'approved')
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Check if already purchased
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('buyer_id', userId)
      .eq('listing_id', listing_id)
      .single();

    if (existingPurchase) {
      return NextResponse.json({ error: 'You already own this runbook' }, { status: 400 });
    }

    // Calculate price based on license type
    let amountPaid: number;
    switch (license_type) {
      case 'team':
        amountPaid = listing.price_team;
        break;
      case 'enterprise':
        amountPaid = listing.price_enterprise;
        break;
      default:
        amountPaid = listing.price_personal;
    }

    // Calculate revenue split (70/30)
    const creatorPayout = Math.round(amountPaid * 0.7);
    const platformFee = amountPaid - creatorPayout;

    // In production, you would create a Stripe PaymentIntent here
    // For now, we'll simulate the purchase
    
    // Create the purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        buyer_id: userId,
        listing_id,
        runbook_id: listing.runbook_id,
        license_type,
        amount_paid: amountPaid,
        creator_payout: creatorPayout,
        platform_fee: platformFee,
        payout_status: 'pending',
        stripe_payment_intent_id: `pi_demo_${Date.now()}` // Demo ID
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('Error creating purchase:', purchaseError);
      return NextResponse.json({ error: 'Failed to process purchase' }, { status: 500 });
    }

    // Copy the runbook to buyer's account
    const originalRunbook = listing.runbooks;
    const { data: copiedRunbook, error: copyError } = await supabase
      .from('runbooks')
      .insert({
        user_id: userId,
        title: `${originalRunbook.title} (Purchased)`,
        description: originalRunbook.description,
        sections: originalRunbook.sections,
        is_public: false
      })
      .select()
      .single();

    if (copyError) {
      console.error('Error copying runbook:', copyError);
      // Purchase still succeeded, just couldn't copy
    }

    return NextResponse.json({
      success: true,
      purchase,
      runbook_id: copiedRunbook?.id || null,
      message: 'Purchase successful! The runbook has been added to your account.'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/marketplace/purchase:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get user's purchases
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: purchases, error } = await supabase
      .from('purchases')
      .select(`
        *,
        marketplace_listings (
          id,
          title,
          description,
          category,
          creator_id
        )
      `)
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching purchases:', error);
      return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
    }

    return NextResponse.json(purchases || []);
  } catch (error) {
    console.error('Error in GET /api/marketplace/purchase:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
