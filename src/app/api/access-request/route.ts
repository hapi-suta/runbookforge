import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// GET - Get user's own request status or all requests (for admins)
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    if (all) {
      // Admin view - get all requests
      const { data: perms } = await supabase
        .from('trainer_permissions')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (perms?.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }

      const { data: requests, error } = await supabase
        .from('trainer_access_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json(requests || []);
    } else {
      // User view - get own request
      const { data: request, error } = await supabase
        .from('trainer_access_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return NextResponse.json(request || null);
    }
  } catch (error) {
    console.error('Error fetching access requests:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

// POST - Submit access request
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Check if user already has access
    const { data: existingPerms } = await supabase
      .from('trainer_permissions')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (existingPerms?.role === 'trainer' || existingPerms?.role === 'admin') {
      return NextResponse.json({ error: 'You already have trainer access' }, { status: 400 });
    }

    // Check for pending request
    const { data: pendingRequest } = await supabase
      .from('trainer_access_requests')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single();

    if (pendingRequest) {
      return NextResponse.json({ error: 'You already have a pending request' }, { status: 400 });
    }

    const body = await request.json();
    const { reason } = body;

    // Get user email
    let userEmail = '';
    let userName = '';
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      userEmail = user.emailAddresses[0]?.emailAddress || '';
      userName = user.firstName || userEmail.split('@')[0] || '';
    } catch (e) {
      console.warn('Could not get user info:', e);
    }

    // Create request
    const { data: accessRequest, error } = await supabase
      .from('trainer_access_requests')
      .insert({
        user_id: userId,
        email: userEmail,
        name: userName,
        reason: reason || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Notify admins (optional - could send email to admin emails)
    // For now, they'll see it in the dashboard

    return NextResponse.json({
      success: true,
      request: accessRequest,
      message: 'Your request has been submitted. An admin will review it shortly.',
    });
  } catch (error) {
    console.error('Error creating access request:', error);
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}

// PATCH - Approve or reject request (admin only)
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Verify admin
    const { data: perms } = await supabase
      .from('trainer_permissions')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (perms?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { requestId, action, notes } = body;

    if (!requestId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get the request
    const { data: accessRequest, error: fetchError } = await supabase
      .from('trainer_access_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !accessRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (accessRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request has already been processed' }, { status: 400 });
    }

    // Update request status
    await supabase
      .from('trainer_access_requests')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        review_notes: notes || null,
      })
      .eq('id', requestId);

    // If approved, grant trainer access
    if (action === 'approve') {
      await supabase.from('trainer_permissions').upsert({
        user_id: accessRequest.user_id,
        role: 'trainer',
        ai_approved: true,
        approved_by: userId,
        approved_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      // Send approval email
      if (accessRequest.email) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://runbookforge.com';
        await sendEmail({
          to: accessRequest.email,
          subject: '🎉 Your trainer access has been approved!',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #14b8a6;">Access Approved!</h1>
              <p>Great news! Your request for trainer access has been approved.</p>
              <p>You can now access the Training Center and create courses.</p>
              <a href="${baseUrl}/dashboard/training" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #14b8a6, #10b981); color: white; text-decoration: none; border-radius: 8px; margin-top: 20px;">
                Go to Training Center →
              </a>
            </div>
          `,
        });
      }
    } else {
      // Send rejection email
      if (accessRequest.email) {
        await sendEmail({
          to: accessRequest.email,
          subject: 'Update on your trainer access request',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #ef4444;">Request Not Approved</h1>
              <p>Unfortunately, your request for trainer access was not approved at this time.</p>
              ${notes ? `<p><strong>Reason:</strong> ${notes}</p>` : ''}
              <p>If you believe this is an error, please contact the administrator.</p>
            </div>
          `,
        });
      }
    }

    return NextResponse.json({
      success: true,
      action,
      message: action === 'approve' ? 'Request approved and trainer access granted' : 'Request rejected',
    });
  } catch (error) {
    console.error('Error processing access request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

