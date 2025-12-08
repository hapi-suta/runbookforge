import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

// GET - List all runbooks for current user
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('runbooks')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
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

    const body = await request.json()
    const { title, description, sections } = body

    const { data, error } = await supabase
      .from('runbooks')
      .insert([
        {
          user_id: userId,
          title: title || 'Untitled Runbook',
          description: description || null,
          sections: sections || [],
          is_public: false,
        }
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating runbook:', error)
    return NextResponse.json({ error: 'Failed to create runbook' }, { status: 500 })
  }
}
