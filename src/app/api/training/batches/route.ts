import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate random access code
function generateAccessCode(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// GET - List all batches for current user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: batches, error } = await supabase
      .from('training_batches')
      .select(`
        *,
        training_modules (count),
        training_enrollments (count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the count aggregates
    const transformedBatches = batches?.map(batch => ({
      ...batch,
      module_count: batch.training_modules?.[0]?.count || 0,
      student_count: batch.training_enrollments?.[0]?.count || 0,
    }));

    return NextResponse.json(transformedBatches || []);
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 });
  }
}

// POST - Create new batch
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, settings } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Generate unique access code
    const accessCode = generateAccessCode(10);

    const { data: batch, error } = await supabase
      .from('training_batches')
      .insert({
        user_id: userId,
        title,
        description,
        access_code: accessCode,
        settings: settings || {},
        status: 'draft'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 });
  }
}
