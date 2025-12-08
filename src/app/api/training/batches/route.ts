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

// Section templates - auto-created when batch is created
const SECTION_TEMPLATES = {
  full_course: [
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
  assessment: [
    { section_key: 'assess', title: 'Assessments', description: 'Quizzes and tests', icon: 'ClipboardCheck', color: 'purple', sort_order: 1 },
  ],
  interview_prep: [
    { section_key: 'learn', title: 'Study Materials', description: 'Preparation guides and concepts', icon: 'BookOpen', color: 'amber', sort_order: 1 },
    { section_key: 'career', title: 'Interview Practice', description: 'Questions and mock interviews', icon: 'Briefcase', color: 'emerald', sort_order: 2 },
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

    const { data: batches, error } = await supabase
      .from('training_batches')
      .select(`
        *,
        training_sections (count),
        training_modules (count),
        training_enrollments (count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

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
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, template = 'full_course', settings } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const accessCode = generateAccessCode(10);

    const { data: batch, error: batchError } = await supabase
      .from('training_batches')
      .insert({
        user_id: userId,
        title,
        description,
        access_code: accessCode,
        template,
        settings: settings || {},
        status: 'draft'
      })
      .select()
      .single();

    if (batchError) throw batchError;

    // Create default sections based on template
    const sectionTemplate = SECTION_TEMPLATES[template as keyof typeof SECTION_TEMPLATES] || SECTION_TEMPLATES.full_course;
    
    if (sectionTemplate.length > 0) {
      const sections = sectionTemplate.map(section => ({
        ...section,
        batch_id: batch.id
      }));

      await supabase.from('training_sections').insert(sections);
    }

    return NextResponse.json({ 
      ...batch, 
      section_count: sectionTemplate.length,
      module_count: 0,
      student_count: 0 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({ 
    templates: Object.keys(SECTION_TEMPLATES).map(key => ({
      id: key,
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      sections: SECTION_TEMPLATES[key as keyof typeof SECTION_TEMPLATES]
    }))
  });
}
