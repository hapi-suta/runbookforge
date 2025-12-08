import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// Prevent static rendering - this route uses auth headers
export const dynamic = 'force-dynamic';

// GET - Get creator dashboard data
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create creator account
    let { data: creatorAccount, error: accountError } = await supabase
      .from('creator_accounts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!creatorAccount) {
      // Create creator account if doesn't exist
      const { data: newAccount, error: createError } = await supabase
        .from('creator_accounts')
        .insert({
          user_id: userId,
          stripe_account_status: 'pending',
          payouts_enabled: false,
          total_earnings: 0,
          pending_balance: 0,
          total_sales: 0
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating creator account:', createError);
        return NextResponse.json({ error: 'Failed to create creator account' }, { status: 500 });
      }
      creatorAccount = newAccount;
    }

    // Get creator's listings
    const { data: listings, error: listingsError } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (listingsError) {
      console.error('Error fetching listings:', listingsError);
    }

    // Get recent sales (purchases of creator's listings)
    const listingIds = listings?.map(l => l.id) || [];
    let recentSales: any[] = [];
    
    if (listingIds.length > 0) {
      const { data: sales, error: salesError } = await supabase
        .from('purchases')
        .select(`
          *,
          marketplace_listings (
            title
          )
        `)
        .in('listing_id', listingIds)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!salesError && sales) {
        recentSales = sales;
      }
    }

    // Get payouts
    const { data: payouts } = await supabase
      .from('creator_payouts')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate stats
    const listingsWithRating = listings?.map(listing => ({
      ...listing,
      rating: listing.rating_count > 0 
        ? (listing.rating_sum / listing.rating_count).toFixed(1) 
        : null
    }));

    const totalEarnings = creatorAccount?.total_earnings || 0;
    const pendingBalance = creatorAccount?.pending_balance || 0;
    const totalSales = creatorAccount?.total_sales || 0;
    const activeListings = listings?.filter(l => l.status === 'approved').length || 0;
    
    // Calculate average rating across all listings
    const ratingsSum = listings?.reduce((sum, l) => sum + (l.rating_sum || 0), 0) || 0;
    const ratingsCount = listings?.reduce((sum, l) => sum + (l.rating_count || 0), 0) || 0;
    const avgRating = ratingsCount > 0 ? (ratingsSum / ratingsCount).toFixed(1) : null;

    // Calculate this month's earnings
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthSales = recentSales.filter(s => new Date(s.created_at) >= firstOfMonth);
    const thisMonthEarnings = thisMonthSales.reduce((sum, s) => sum + s.creator_payout, 0);

    return NextResponse.json({
      account: creatorAccount,
      stats: {
        totalEarnings,
        pendingBalance,
        totalSales,
        activeListings,
        avgRating,
        thisMonthEarnings,
        thisMonthSales: thisMonthSales.length
      },
      listings: listingsWithRating || [],
      recentSales,
      payouts: payouts || []
    });

  } catch (error) {
    console.error('Error in GET /api/creator:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Setup or update creator account
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'setup_stripe') {
      // In production, this would create a Stripe Connect account
      // and return an onboarding URL
      
      // For demo, we'll simulate the process
      const { data, error } = await supabase
        .from('creator_accounts')
        .upsert({
          user_id: userId,
          stripe_account_id: `acct_demo_${Date.now()}`,
          stripe_account_status: 'active',
          payouts_enabled: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error setting up Stripe:', error);
        return NextResponse.json({ error: 'Failed to setup Stripe' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Stripe account connected successfully!',
        account: data
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error in POST /api/creator:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
