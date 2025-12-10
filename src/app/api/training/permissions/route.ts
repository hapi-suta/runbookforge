import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Check if user has permissions record
    const { data: permissions } = await supabase
      .from('trainer_permissions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (permissions) {
      return NextResponse.json({
        role: permissions.role,
        ai_approved: permissions.ai_approved,
      });
    }

    // Default: users are trainers with AI access (until admin system is needed)
    return NextResponse.json({
      role: 'trainer',
      ai_approved: true,
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    // Default to trainer with AI access if table doesn't exist
    return NextResponse.json({
      role: 'trainer',
      ai_approved: true,
    });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = getSupabaseAdmin();

    // Check if current user is admin
    const { data: currentUser } = await supabase
      .from('trainer_permissions')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Update target user's permissions
    const { target_user_id, role, ai_approved } = body;

    const { data, error } = await supabase
      .from('trainer_permissions')
      .upsert({
        user_id: target_user_id,
        role: role || 'trainer',
        ai_approved: ai_approved ?? true,
        approved_by: ai_approved ? userId : null,
        approved_at: ai_approved ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating permissions:', error);
    return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 });
  }
}

