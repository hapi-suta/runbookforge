import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Prevent static rendering - this route uses auth headers
export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ isAdmin: false });
    }

    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', userId)
      .single();

    return NextResponse.json({ isAdmin: !!data });
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json({ isAdmin: false });
  }
}
