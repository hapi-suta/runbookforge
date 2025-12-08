import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Check if user is admin (from env var or database)
async function isUserAdmin(userId: string): Promise<boolean> {
  // First check env var (primary admin)
  const envAdmins = process.env.ADMIN_USER_IDS?.split(',') || [];
  if (envAdmins.includes(userId)) return true;
  
  // Then check database for added admins
  const { data } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();
  
  return !!data;
}

// GET - Check if current user is admin
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ isAdmin: false });
    }

    const isAdmin = await isUserAdmin(userId);
    
    // If admin, also return list of all admins
    if (isAdmin) {
      const { data: admins } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Get primary admin from env
      const primaryAdminId = process.env.ADMIN_USER_IDS?.split(',')[0];
      
      return NextResponse.json({ 
        isAdmin: true,
        isPrimaryAdmin: userId === primaryAdminId,
        admins: admins || []
      });
    }

    return NextResponse.json({ isAdmin: false });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false });
  }
}

// POST - Add new admin (only primary admin can do this)
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only primary admin (first in env var) can add admins
    const primaryAdminId = process.env.ADMIN_USER_IDS?.split(',')[0];
    if (userId !== primaryAdminId) {
      return NextResponse.json({ error: 'Only primary admin can add admins' }, { status: 403 });
    }

    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if already exists
    const { data: existing } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Admin already exists' }, { status: 400 });
    }

    const { data: admin, error } = await supabase
      .from('admin_users')
      .insert({
        email: email.toLowerCase(),
        name,
        added_by: userId,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(admin, { status: 201 });
  } catch (error) {
    console.error('Error adding admin:', error);
    return NextResponse.json({ error: 'Failed to add admin' }, { status: 500 });
  }
}

// DELETE - Remove admin
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const primaryAdminId = process.env.ADMIN_USER_IDS?.split(',')[0];
    if (userId !== primaryAdminId) {
      return NextResponse.json({ error: 'Only primary admin can remove admins' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('id');

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', adminId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing admin:', error);
    return NextResponse.json({ error: 'Failed to remove admin' }, { status: 500 });
  }
}
