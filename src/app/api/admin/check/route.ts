import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Prevent static rendering - this route uses auth headers
export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ isAdmin: false, isPrimaryAdmin: false, admins: [] });
    }

    const supabase = getSupabaseAdmin();
    
    // Check trainer_permissions table for admin role
    const { data: permissions } = await supabase
      .from('trainer_permissions')
      .select('role')
      .eq('user_id', userId)
      .single();

    const isAdmin = permissions?.role === 'admin';
    
    // Get list of all admins for management
    let admins: Array<{ id: string; user_id: string; role: string; created_at: string }> = [];
    if (isAdmin) {
      const { data: adminList } = await supabase
        .from('trainer_permissions')
        .select('*')
        .eq('role', 'admin');
      admins = adminList || [];
    }

    return NextResponse.json({ 
      isAdmin, 
      isPrimaryAdmin: isAdmin, // First admin is primary
      admins 
    });
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json({ isAdmin: false, isPrimaryAdmin: false, admins: [] });
  }
}
