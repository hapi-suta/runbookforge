import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Default section templates
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
};

// GET - Get sections for a batch
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // Verify batch ownership
    const { data: batch } = await supabase
      .from('training_batches')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const { data: sections, error } = await supabase
      .from('training_sections')
      .select('*')
      .eq('batch_id', id)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return NextResponse.json(sections || []);
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
  }
}

// POST - Add sections to a batch (uses template or custom)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // Verify batch ownership
    const { data: batch } = await supabase
      .from('training_batches')
      .select('id, settings')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const body = await request.json();
    const { template = 'technical_course', custom_sections } = body;

    // Check if sections already exist
    const { data: existing } = await supabase
      .from('training_sections')
      .select('id')
      .eq('batch_id', id);

    if (existing && existing.length > 0) {
      return NextResponse.json({ 
        error: 'Sections already exist for this batch',
        existing_count: existing.length 
      }, { status: 400 });
    }

    // Get sections to create
    let sectionsToCreate;
    if (custom_sections && Array.isArray(custom_sections)) {
      sectionsToCreate = custom_sections.map((s, i) => ({
        batch_id: id,
        section_key: s.section_key || `custom_${i}`,
        title: s.title,
        description: s.description || '',
        icon: s.icon || 'FolderOpen',
        color: s.color || 'blue',
        sort_order: s.sort_order || i + 1,
      }));
    } else {
      const templateSections = SECTION_TEMPLATES[template as keyof typeof SECTION_TEMPLATES] || SECTION_TEMPLATES.technical_course;
      sectionsToCreate = templateSections.map(s => ({
        ...s,
        batch_id: id,
      }));
    }

    const { data: sections, error } = await supabase
      .from('training_sections')
      .insert(sectionsToCreate)
      .select();

    if (error) throw error;
    return NextResponse.json(sections, { status: 201 });
  } catch (error) {
    console.error('Error creating sections:', error);
    return NextResponse.json({ error: 'Failed to create sections' }, { status: 500 });
  }
}
