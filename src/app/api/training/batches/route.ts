import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Prevent static rendering - this route uses auth headers
export const dynamic = 'force-dynamic';

// Generate random access code
function generateAccessCode(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Section templates - auto-created when batch is created
const SECTION_TEMPLATES = {
  technical_course: [
    { section_key: 'learn', title: 'Learn', description: 'Presentations, tutorials, and reading materials', icon: 'BookOpen', color: 'amber', sort_order: 1 },
    { section_key: 'practice', title: 'Practice', description: 'Labs, runbooks, and hands-on exercises', icon: 'Wrench', color: 'teal', sort_order: 2 },
    { section_key: 'assess', title: 'Assess', description: 'Quizzes, assignments, and challenges', icon: 'ClipboardCheck', color: 'purple', sort_order: 3 },
    { section_key: 'resources', title: 'Resources', description: 'Reference materials and recordings', icon: 'FolderOpen', color: 'blue', sort_order: 4 },
    { section_key: 'career', title: 'Career', description: 'Interview prep and career resources', icon: 'Briefcase', color: 'emerald', sort_order: 5 },
  ],
  workshop: [
    { section_key: 'learn', title: 'Learn', description: 'Workshop presentations', icon: 'BookOpen', color: 'amber', sort_order: 1 },
    { section_key: 'practice', title: 'Practice', description: 'Hands-on labs and exercises', icon: 'Wrench', color: 'teal', sort_order: 2 },
    { section_key: 'resources', title: 'Resources', description: 'Additional materials', icon: 'FolderOpen', color: 'blue', sort_order: 3 },
  ],
  interview_prep: [
    { section_key: 'learn', title: 'Study Materials', description: 'Preparation guides and concepts', icon: 'BookOpen', color: 'amber', sort_order: 1 },
    { section_key: 'career', title: 'Interview Practice', description: 'Questions and mock interviews', icon: 'Briefcase', color: 'emerald', sort_order: 2 },
  ],
  certification: [
    { section_key: 'learn', title: 'Study Guide', description: 'Comprehensive study materials', icon: 'BookOpen', color: 'amber', sort_order: 1 },
    { section_key: 'assess', title: 'Practice Tests', description: 'Mock exams and quizzes', icon: 'ClipboardCheck', color: 'purple', sort_order: 2 },
    { section_key: 'resources', title: 'Resources', description: 'Additional study resources', icon: 'FolderOpen', color: 'blue', sort_order: 3 },
  ],
  custom: []
};

// GET - List all batches for current user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    
    // First try with sections, fallback without
    let batches;
    let error;
    
    ({ data: batches, error } = await supabase
      .from('training_batches')
      .select(`
        *,
        training_sections (count),
        training_modules (count),
        training_enrollments (count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }));

    // If sections table doesn't exist, try without it
    if (error && error.message.includes('training_sections')) {
      ({ data: batches, error } = await supabase
        .from('training_batches')
        .select(`
          *,
          training_modules (count),
          training_enrollments (count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false }));
    }

    if (error) throw error;

    const transformedBatches = batches?.map(batch => ({
      ...batch,
      section_count: batch.training_sections?.[0]?.count || 0,
      module_count: batch.training_modules?.[0]?.count || 0,
      student_count: batch.training_enrollments?.[0]?.count || 0,
    }));

    return NextResponse.json(transformedBatches || []);
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 });
  }
}

// POST - Create new batch with auto-generated sections
export async function POST(request: Request) {
  console.log('POST /api/training/batches called');
  
  try {
    const { userId } = await auth();
    console.log('User ID:', userId);
    
    if (!userId) {
      console.log('No userId - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    
    let body;
    try {
      body = await request.json();
      console.log('Request body:', body);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    
    const { title, description, template = 'technical_course', settings } = body;

    if (!title || !title.trim()) {
      console.log('No title provided');
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const accessCode = generateAccessCode(10);
    console.log('Generated access code:', accessCode);

    // Store template in settings since template column may not exist
    const insertData = {
      user_id: userId,
      title: title.trim(),
      description: description?.trim() || null,
      access_code: accessCode,
      settings: { ...(settings || {}), template },
      status: 'draft'
    };
    console.log('Inserting batch:', insertData);
    
    const { data: batch, error: batchError } = await supabase
      .from('training_batches')
      .insert(insertData)
      .select()
      .single();

    if (batchError) {
      console.error('Batch creation error:', batchError);
      return NextResponse.json({ 
        error: `Database error: ${batchError.message}`,
        details: batchError 
      }, { status: 500 });
    }
    
    console.log('Batch created:', batch);

    // Create default sections based on template (don't fail if table doesn't exist)
    const sectionTemplate = SECTION_TEMPLATES[template as keyof typeof SECTION_TEMPLATES] || SECTION_TEMPLATES.technical_course;
    let sectionCount = 0;
    
    if (sectionTemplate.length > 0) {
      const sections = sectionTemplate.map(section => ({
        ...section,
        batch_id: batch.id
      }));
      
      console.log('Creating sections:', sections);

      const { error: sectionError } = await supabase.from('training_sections').insert(sections);
      if (!sectionError) {
        sectionCount = sectionTemplate.length;
        console.log('Sections created:', sectionCount);
      } else {
        console.warn('Could not create sections (table may not exist):', sectionError.message);
      }
    }

    const result = { 
      ...batch, 
      section_count: sectionCount,
      module_count: 0,
      student_count: 0 
    };
    console.log('Returning result:', result);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create batch',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
