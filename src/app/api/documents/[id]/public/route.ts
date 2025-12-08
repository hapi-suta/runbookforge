import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Prevent static rendering
export const dynamic = 'force-dynamic';

// GET - Get document for public viewing (no auth required)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data: document, error } = await supabase
      .from('documents')
      .select('id, title, description, file_type, metadata, created_at')
      .eq('id', id)
      .single();

    if (error || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}
