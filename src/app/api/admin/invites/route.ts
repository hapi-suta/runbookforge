import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// GET - List all invites
export async function GET() {
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

    const { data: invites, error } = await supabase
      .from('trainer_invites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(invites || []);
  } catch (error) {
    console.error('Error fetching invites:', error);
    return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 });
  }
}

// POST - Send new invite
export async function POST(request: Request) {
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
    const { email, role = 'trainer', aiApproved = true } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if already has access
    const { data: existing } = await supabase
      .from('trainer_permissions')
      .select('role')
      .eq('user_id', cleanEmail)
      .single();

    // Check for pending invite
    const { data: pendingInvite } = await supabase
      .from('trainer_invites')
      .select('id')
      .eq('email', cleanEmail)
      .eq('status', 'pending')
      .single();

    if (pendingInvite) {
      return NextResponse.json({ error: 'An invite is already pending for this email' }, { status: 400 });
    }

    // Create invite
    const { data: invite, error } = await supabase
      .from('trainer_invites')
      .insert({
        email: cleanEmail,
        role,
        invited_by: userId,
        ai_approved: aiApproved,
      })
      .select()
      .single();

    if (error) throw error;

    // Get inviter name
    let inviterName = 'An administrator';
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      inviterName = user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || inviterName;
    } catch (e) {
      console.warn('Could not get inviter name:', e);
    }

    // Send invite email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://runbookforge.com';
    const acceptUrl = `${baseUrl}/invite/accept?token=${invite.invite_token}`;

    const emailResult = await sendEmail({
      to: cleanEmail,
      subject: `You're invited to be a ${role} on RunbookForge`,
      html: getInviteEmailHtml({ email: cleanEmail, role, inviterName, acceptUrl }),
    });

    return NextResponse.json({
      success: true,
      invite,
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error('Error creating invite:', error);
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
  }
}

// DELETE - Revoke invite
export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get('id');

    if (!inviteId) {
      return NextResponse.json({ error: 'Invite ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('trainer_invites')
      .update({ status: 'revoked' })
      .eq('id', inviteId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking invite:', error);
    return NextResponse.json({ error: 'Failed to revoke invite' }, { status: 500 });
  }
}

function getInviteEmailHtml({ email, role, inviterName, acceptUrl }: { email: string; role: string; inviterName: string; acceptUrl: string }): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #0a0f1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0f1a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
          <tr>
            <td style="background: linear-gradient(135deg, #14b8a6 0%, #10b981 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">🎉 You're Invited!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 32px;">
              <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.6;">
                Hi there,
              </p>
              <p style="margin: 0 0 24px; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                <strong>${inviterName}</strong> has invited you to join RunbookForge as a <strong style="color: #14b8a6;">${role}</strong>.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(20, 184, 166, 0.1); border: 1px solid rgba(20, 184, 166, 0.3); border-radius: 12px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 12px; color: #14b8a6; font-size: 16px;">As a ${role}, you'll be able to:</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #94a3b8; font-size: 14px; line-height: 1.8;">
                      ${role === 'admin' ? `
                        <li>Access the Training Center</li>
                        <li>Create and manage courses</li>
                        <li>Use AI content generation</li>
                        <li>Manage other users and trainers</li>
                        <li>Access the Admin Dashboard</li>
                      ` : `
                        <li>Access the Training Center</li>
                        <li>Create and manage courses</li>
                        <li>Use AI content generation</li>
                        <li>Enroll and manage students</li>
                      `}
                    </ul>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 32px;">
                    <a href="${acceptUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #14b8a6 0%, #10b981 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(20, 184, 166, 0.4);">
                      Accept Invitation →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 16px; color: #64748b; font-size: 14px; line-height: 1.6;">
                This invitation expires in 7 days. If you didn't expect this invite, you can safely ignore it.
              </p>
              
              <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">
              
              <p style="margin: 0; color: #475569; font-size: 13px;">
                Sent to ${email}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; background: #0f172a; border-top: 1px solid #1e293b;">
              <p style="margin: 0; color: #64748b; font-size: 14px; font-weight: 600;">RunbookForge</p>
              <p style="margin: 4px 0 0; color: #475569; font-size: 12px;">Create amazing learning experiences</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

