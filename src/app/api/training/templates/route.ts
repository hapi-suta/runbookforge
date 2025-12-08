import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - List available templates
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get system templates and user's custom templates
    const { data: templates, error } = await supabase
      .from('batch_templates')
      .select('*')
      .or(`is_system.eq.true,user_id.eq.${userId}`)
      .order('is_system', { ascending: false })
      .order('name');

    if (error) throw error;

    return NextResponse.json(templates || []);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

// POST - Create custom template
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, icon, structure } = body;

    if (!name || !structure) {
      return NextResponse.json({ error: 'Name and structure are required' }, { status: 400 });
    }

    const { data: template, error } = await supabase
      .from('batch_templates')
      .insert({
        name,
        description,
        icon: icon || 'Folder',
        structure,
        is_system: false,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
