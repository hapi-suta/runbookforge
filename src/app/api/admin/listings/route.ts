import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// Admin user IDs - in production, store these in environment variables or database
const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(',') || [];

function isAdmin(userId: string): boolean {
  return ADMIN_USER_IDS.includes(userId);
}

// GET - Get all listings for admin review
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId || !isAdmin(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

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
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching listings:', error);
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in GET /api/admin/listings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update listing status (approve/reject)
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId || !isAdmin(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { listing_id, action, rejection_reason, featured } = body;

    if (!listing_id || !action) {
      return NextResponse.json({ error: 'listing_id and action required' }, { status: 400 });
    }

    const updates: any = { updated_at: new Date().toISOString() };

    switch (action) {
      case 'approve':
        updates.status = 'approved';
        break;
      case 'reject':
        updates.status = 'rejected';
        updates.rejection_reason = rejection_reason || 'Does not meet quality standards';
        break;
      case 'feature':
        updates.featured = true;
        break;
      case 'unfeature':
        updates.featured = false;
        break;
      case 'archive':
        updates.status = 'archived';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('marketplace_listings')
      .update(updates)
      .eq('id', listing_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating listing:', error);
      return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/admin/listings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
