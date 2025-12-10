import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
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
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch all trainer permissions
    const { data: trainers, error } = await supabase
      .from('trainer_permissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trainers:', error);
      return NextResponse.json({ error: 'Failed to fetch trainers' }, { status: 500 });
    }

    return NextResponse.json(trainers || []);

  } catch (error) {
    console.error('Error in trainers API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

