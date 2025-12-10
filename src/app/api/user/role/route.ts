import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Define admin emails (can be moved to env variable or database)
const ADMIN_EMAILS = [
  'admin@runbookforge.com',
  'admin@suta.com',
  // Add your admin emails here
];

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
      // PGRST116 = no rows returned, which is fine
      console.error('Error fetching permissions:', error);
    }

    // If user has permissions in the table, return that role
    if (permissions) {
      return NextResponse.json({
        role: permissions.role,
        aiApproved: permissions.ai_approved,
      });
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

    // Check if current user is admin
    const { data: currentUserPerms } = await supabase
      .from('trainer_permissions')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (currentUserPerms?.role !== 'admin') {
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

