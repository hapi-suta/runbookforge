import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Get admin emails from environment variable
function getAdminEmails(): string[] {
  const envEmails = process.env.ADMIN_EMAILS || '';
  return envEmails.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
}

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ role: 'guest' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Check trainer_permissions table for user role
    const { data: permissions, error } = await supabase
      .from('trainer_permissions')
      .select('role, ai_approved')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching permissions:', error);
    }

    // If user has permissions in the table, return that role
    if (permissions) {
      return NextResponse.json({
        role: permissions.role,
        aiApproved: permissions.ai_approved,
      });
    }

    // Check if user's email is in admin list (auto-admin)
    const adminEmails = getAdminEmails();
    if (adminEmails.length > 0) {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
        
        if (userEmail && adminEmails.includes(userEmail)) {
          // Auto-create admin permissions for this user
          await supabase.from('trainer_permissions').upsert({
            user_id: userId,
            role: 'admin',
            ai_approved: true,
            approved_by: 'auto',
            approved_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

          return NextResponse.json({
            role: 'admin',
            aiApproved: true,
          });
        }
      } catch (e) {
        console.warn('Could not check admin emails:', e);
      }
    }

    // Default: regular user (no trainer/admin access)
    return NextResponse.json({
      role: 'user',
      aiApproved: false,
    });

  } catch (error) {
    console.error('Error checking user role:', error);
    return NextResponse.json({ role: 'user', aiApproved: false });
  }
}

// POST - Allow admins to set user roles
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Check if current user is admin (including auto-admin check)
    let isAdmin = false;
    
    const { data: currentUserPerms } = await supabase
      .from('trainer_permissions')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (currentUserPerms?.role === 'admin') {
      isAdmin = true;
    } else {
      // Check auto-admin emails
      const adminEmails = getAdminEmails();
      if (adminEmails.length > 0) {
        try {
          const client = await clerkClient();
          const user = await client.users.getUser(userId);
          const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
          if (userEmail && adminEmails.includes(userEmail)) {
            isAdmin = true;
          }
        } catch (e) {
          console.warn('Could not verify admin email:', e);
        }
      }
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Only admins can change roles' }, { status: 403 });
    }

    const body = await request.json();
    const { targetUserId, role, aiApproved } = body;

    if (!targetUserId || !role) {
      return NextResponse.json({ error: 'targetUserId and role are required' }, { status: 400 });
    }

    if (!['user', 'student', 'trainer', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Upsert the user's permissions
    const { data, error } = await supabase
      .from('trainer_permissions')
      .upsert({
        user_id: targetUserId,
        role,
        ai_approved: aiApproved ?? false,
        approved_by: role === 'trainer' || role === 'admin' ? userId : null,
        approved_at: role === 'trainer' || role === 'admin' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating permissions:', error);
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error setting user role:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
