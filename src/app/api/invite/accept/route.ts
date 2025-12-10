import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// POST - Accept an invite
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Please sign in to accept this invitation' }, { status: 401 });
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Invite token is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Find the invite
    const { data: invite, error: findError } = await supabase
      .from('trainer_invites')
      .select('*')
      .eq('invite_token', token)
      .single();

    if (findError || !invite) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }

    // Check invite status
    if (invite.status !== 'pending') {
      return NextResponse.json({ error: `This invitation has already been ${invite.status}` }, { status: 400 });
    }

    // Check expiration
    if (new Date(invite.expires_at) < new Date()) {
      await supabase
        .from('trainer_invites')
        .update({ status: 'expired' })
        .eq('id', invite.id);
      return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 });
    }

    // Grant the role
    const { error: permError } = await supabase
      .from('trainer_permissions')
      .upsert({
        user_id: userId,
        role: invite.role,
        ai_approved: invite.ai_approved,
        approved_by: invite.invited_by,
        approved_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (permError) {
      console.error('Error granting permissions:', permError);
      return NextResponse.json({ error: 'Failed to grant access' }, { status: 500 });
    }

    // Mark invite as accepted
    await supabase
      .from('trainer_invites')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: userId,
      })
      .eq('id', invite.id);

    return NextResponse.json({
      success: true,
      role: invite.role,
      message: `You now have ${invite.role} access!`,
    });
  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 });
  }
}

// GET - Check invite status (for the accept page)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: invite, error } = await supabase
      .from('trainer_invites')
      .select('email, role, status, expires_at, ai_approved')
      .eq('invite_token', token)
      .single();

    if (error || !invite) {
      return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });
    }

    const isExpired = new Date(invite.expires_at) < new Date();

    return NextResponse.json({
      email: invite.email,
      role: invite.role,
      status: isExpired ? 'expired' : invite.status,
      aiApproved: invite.ai_approved,
    });
  } catch (error) {
    console.error('Error checking invite:', error);
    return NextResponse.json({ error: 'Failed to check invitation' }, { status: 500 });
  }
}

