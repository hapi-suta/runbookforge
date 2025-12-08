import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET - List all runbooks for current user
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('runbooks')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching runbooks:', error)
    return NextResponse.json({ error: 'Failed to fetch runbooks' }, { status: 500 })
  }
}

// POST - Create a new runbook
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const body = await request.json()
    const { title, description, sections } = body

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (title.trim().length > 200) {
      return NextResponse.json({ error: 'Title must be less than 200 characters' }, { status: 400 })
    }

    // Sanitize sections - ensure it's a valid array
    const sanitizedSections = Array.isArray(sections) ? sections : []

    const { data, error } = await supabase
      .from('runbooks')
      .insert([
        {
          user_id: userId,
          title: title.trim(),
          description: description?.trim() || null,
          sections: sanitizedSections,
          is_public: false,
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating runbook:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create runbook' 
    }, { status: 500 })
  }
}
