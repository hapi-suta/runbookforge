import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

async function isAdmin(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('admin_users').select('id').eq('user_id', userId).single();
  return !!data;
}

// GET - Get pending entries for review
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('kb_entries')
      .select(`*, kb_categories (name), runbooks (title), documents (title)`)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching pending entries:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

// PATCH - Approve or reject entry
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();
    const { entry_id, action, rejection_reason } = await request.json();

    if (!entry_id || !action) {
      return NextResponse.json({ error: 'entry_id and action required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = { reviewed_by: userId, reviewed_at: new Date().toISOString() };
    
    if (action === 'approve') {
      updates.status = 'approved';
    } else if (action === 'reject') {
      updates.status = 'rejected';
      updates.rejection_reason = rejection_reason || 'Does not meet guidelines';
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('kb_entries')
      .update(updates)
      .eq('id', entry_id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}
