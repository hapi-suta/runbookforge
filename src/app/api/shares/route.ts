import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Prevent static rendering - this route uses auth headers
export const dynamic = 'force-dynamic';

// GET - Get shares for a resource or shared with user
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const resourceType = searchParams.get('resource_type');
    const resourceId = searchParams.get('resource_id');
    const sharedWithMe = searchParams.get('shared_with_me');

    const supabase = getSupabaseAdmin();

    if (sharedWithMe) {
      // Get items shared with the current user (need their email from Clerk)
      // For now, return shares where they are the owner
      const { data: shares, error } = await supabase
        .from('shares')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching shares:', error);
        return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 });
      }

      return NextResponse.json(shares || []);
    }

    if (resourceType && resourceId) {
      // Get shares for a specific resource
      const { data: shares, error } = await supabase
        .from('shares')
        .select('*')
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching shares:', error);
        return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 });
      }

      return NextResponse.json(shares || []);
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error in GET /api/shares:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new share
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, resource_type, resource_id, permission = 'view' } = body;

    if (!email || !resource_type || !resource_id) {
      return NextResponse.json({ 
        error: 'Missing required fields: email, resource_type, resource_id' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Verify the user owns the resource
    let ownsResource = false;
    if (resource_type === 'document') {
      const { data } = await supabase
        .from('documents')
        .select('id')
        .eq('id', resource_id)
        .eq('user_id', userId)
        .single();
      ownsResource = !!data;
    } else if (resource_type === 'runbook') {
      const { data } = await supabase
        .from('runbooks')
        .select('id')
        .eq('id', resource_id)
        .eq('user_id', userId)
        .single();
      ownsResource = !!data;
    }

    if (!ownsResource) {
      return NextResponse.json({ error: 'Resource not found or access denied' }, { status: 404 });
    }

    const { data: share, error } = await supabase
      .from('shares')
      .insert({
        owner_id: userId,
        shared_with_email: email.toLowerCase(),
        resource_type,
        resource_id,
        permission
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Already shared with this email' }, { status: 400 });
      }
      console.error('Error creating share:', error);
      return NextResponse.json({ error: 'Failed to create share' }, { status: 500 });
    }

    return NextResponse.json(share, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/shares:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove a share
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Share ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('shares')
      .delete()
      .eq('id', id)
      .eq('owner_id', userId);

    if (error) {
      console.error('Error deleting share:', error);
      return NextResponse.json({ error: 'Failed to delete share' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/shares:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update share permission
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, permission } = body;

    if (!id || !permission) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: share, error } = await supabase
      .from('shares')
      .update({ permission })
      .eq('id', id)
      .eq('owner_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating share:', error);
      return NextResponse.json({ error: 'Failed to update share' }, { status: 500 });
    }

    return NextResponse.json(share);
  } catch (error) {
    console.error('Error in PATCH /api/shares:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
