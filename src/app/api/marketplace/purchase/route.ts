import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Prevent static rendering - this route uses auth headers
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { listing_id } = await request.json();

    if (!listing_id) {
      return NextResponse.json({ error: 'listing_id required' }, { status: 400 });
    }

    // Get listing
    const { data: listing } = await supabase
      .from('marketplace_listings')
      .select('*, runbooks (*)')
      .eq('id', listing_id)
      .eq('status', 'approved')
      .single();

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Create purchase record
    const { error: purchaseError } = await supabase
      .from('purchases')
      .insert({ buyer_id: userId, listing_id, amount: listing.price || 0 });

    if (purchaseError) throw purchaseError;

    // Clone runbook for buyer
    const { data: clonedRunbook, error: cloneError } = await supabase
      .from('runbooks')
      .insert({
        user_id: userId,
        title: `${listing.runbooks.title} (Purchased)`,
        description: listing.runbooks.description,
        sections: listing.runbooks.sections,
        is_public: false
      })
      .select()
      .single();

    if (cloneError) throw cloneError;

    // Update download count
    await supabase
      .from('marketplace_listings')
      .update({ download_count: (listing.download_count || 0) + 1 })
      .eq('id', listing_id);

    return NextResponse.json({ runbook_id: clonedRunbook.id }, { status: 201 });
  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
  }
}
