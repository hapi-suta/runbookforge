import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Check if user is admin
async function isUserAdmin(userId: string): Promise<boolean> {
  const envAdmins = process.env.ADMIN_USER_IDS?.split(',') || [];
  if (envAdmins.includes(userId)) return true;
  
  const { data } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();
  
  return !!data;
}

// GET - List pending entries for admin review
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isUserAdmin(userId))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const { data: entries, error } = await supabase
      .from('kb_entries')
      .select(`
        *,
        kb_categories (id, name, slug),
        runbooks (id, title, description),
        documents (id, title, description, file_type)
      `)
      .eq('status', status)
      .order('submitted_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json(entries || []);
  } catch (error) {
    console.error('Error fetching pending entries:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

// PATCH - Approve or reject entry
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isUserAdmin(userId))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { entryId, action, rejectionReason } = body;

    if (!entryId || !action) {
      return NextResponse.json({ error: 'Entry ID and action required' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewed_by: userId,
      reviewed_at: new Date().toISOString()
    };

    if (action === 'approve') {
      updateData.published_at = new Date().toISOString();
    }

    if (action === 'reject' && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }

    const { data: entry, error } = await supabase
      .from('kb_entries')
      .update(updateData)
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error reviewing entry:', error);
    return NextResponse.json({ error: 'Failed to review entry' }, { status: 500 });
  }
}
