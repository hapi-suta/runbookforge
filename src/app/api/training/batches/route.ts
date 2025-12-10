import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Section templates for different batch types
const SECTION_TEMPLATES: Record<string, Array<{key: string; title: string; description: string; icon: string; color: string}>> = {
  technical_course: [
    { key: 'learn', title: 'Learn', description: 'Presentations, tutorials, and reading materials', icon: 'BookOpen', color: 'amber' },
    { key: 'labs', title: 'Labs', description: 'Interactive practice labs with live terminal', icon: 'Terminal', color: 'orange' },
    { key: 'practice', title: 'Practice', description: 'Runbooks and hands-on exercises', icon: 'Wrench', color: 'teal' },
    { key: 'assess', title: 'Assess', description: 'Quizzes, assignments, and challenges', icon: 'ClipboardCheck', color: 'purple' },
    { key: 'resources', title: 'Resources', description: 'Reference materials and recordings', icon: 'FolderOpen', color: 'blue' },
    { key: 'career', title: 'Career', description: 'Interview prep and career resources', icon: 'Briefcase', color: 'emerald' },
  ],
  workshop: [
    { key: 'learn', title: 'Learn', description: 'Workshop materials', icon: 'BookOpen', color: 'amber' },
    { key: 'labs', title: 'Labs', description: 'Interactive practice labs with live terminal', icon: 'Terminal', color: 'orange' },
    { key: 'practice', title: 'Exercises', description: 'Hands-on exercises', icon: 'Wrench', color: 'teal' },
    { key: 'assess', title: 'Challenges', description: 'Challenges and assessments', icon: 'Target', color: 'purple' },
  ],
  interview_prep: [
    { key: 'learn', title: 'Study Materials', description: 'Concepts and theory', icon: 'BookOpen', color: 'amber' },
    { key: 'practice', title: 'Practice Problems', description: 'Coding and problem solving', icon: 'Code', color: 'teal' },
    { key: 'career', title: 'Mock Interviews', description: 'AI-powered mock interviews', icon: 'MessageSquare', color: 'emerald' },
  ],
  certification: [
    { key: 'learn', title: 'Study Guide', description: 'Exam topics and materials', icon: 'BookOpen', color: 'amber' },
    { key: 'assess', title: 'Practice Exams', description: 'Mock exams and quizzes', icon: 'ClipboardCheck', color: 'purple' },
    { key: 'resources', title: 'Resources', description: 'Additional study resources', icon: 'FolderOpen', color: 'blue' },
  ],
  custom: []
};

// GET - List all batches for user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    
    // Get batches with counts
    const { data: batches, error } = await supabase
      .from('training_batches')
      .select(`
        *,
        training_modules(count),
        training_enrollments(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform to include counts
    const result = (batches || []).map(batch => ({
      ...batch,
      module_count: batch.training_modules?.[0]?.count || 0,
      student_count: batch.training_enrollments?.[0]?.count || 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 });
  }
}

// POST - Create new batch with sections
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, template = 'technical_course' } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Create batch
    const { data: batch, error: batchError } = await supabase
      .from('training_batches')
      .insert({
        user_id: userId,
        title: title.trim(),
        description: description?.trim() || null,
        settings: { template_type: template }
      })
      .select()
      .single();

    if (batchError) throw batchError;

    // Create sections based on template
    const sectionTemplate = SECTION_TEMPLATES[template] || SECTION_TEMPLATES.technical_course;
    
    if (sectionTemplate.length > 0) {
      const sections = sectionTemplate.map((s, i) => ({
        batch_id: batch.id,
        section_key: s.key,
        title: s.title,
        description: s.description,
        icon: s.icon,
        color: s.color,
        sort_order: i
      }));

      const { error: sectionsError } = await supabase
        .from('training_sections')
        .insert(sections);

      if (sectionsError) {
        console.error('Error creating sections:', sectionsError);
      }
    }

    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 });
  }
}
