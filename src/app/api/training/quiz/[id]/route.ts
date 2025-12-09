import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - Get quiz questions
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contentId } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { data: enrollment } = await supabase
      .from('training_enrollments')
      .select('id, status')
      .eq('access_token', token)
      .single();

    if (!enrollment || enrollment.status !== 'active') {
      return NextResponse.json({ error: 'Invalid access' }, { status: 403 });
    }

    const { data: questions } = await supabase
      .from('quiz_questions')
      .select('id, question_type, question, options, points, sort_order')
      .eq('content_id', contentId)
      .order('sort_order');

    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('id, score, max_score, percentage, completed_at')
      .eq('enrollment_id', enrollment.id)
      .eq('content_id', contentId)
      .order('started_at', { ascending: false });

    return NextResponse.json({ questions: questions || [], attempts: attempts || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 });
  }
}

// POST - Submit quiz
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contentId } = await params;
    const { token, answers } = await request.json();

    if (!token || !answers) {
      return NextResponse.json({ error: 'Token and answers required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: enrollment } = await supabase
      .from('training_enrollments')
      .select('id, status')
      .eq('access_token', token)
      .single();

    if (!enrollment || enrollment.status !== 'active') {
      return NextResponse.json({ error: 'Invalid access' }, { status: 403 });
    }

    const { data: questions } = await supabase
      .from('quiz_questions')
      .select('id, question_type, correct_answer, points, explanation')
      .eq('content_id', contentId);

    if (!questions?.length) {
      return NextResponse.json({ error: 'No questions found' }, { status: 404 });
    }

    let score = 0, maxScore = 0;
    const results: Record<string, { correct: boolean; correctAnswer: unknown; explanation?: string }> = {};

    for (const q of questions) {
      maxScore += q.points || 1;
      const userAnswer = answers[q.id];
      let isCorrect = false;

      if (q.question_type === 'multi_select') {
        const correct = Array.isArray(q.correct_answer) ? q.correct_answer : [];
        const user = Array.isArray(userAnswer) ? userAnswer : [];
        isCorrect = correct.length === user.length && correct.every((a: string) => user.includes(a));
      } else {
        isCorrect = String(userAnswer).toLowerCase() === String(q.correct_answer).toLowerCase();
      }

      if (isCorrect) score += q.points || 1;
      results[q.id] = { correct: isCorrect, correctAnswer: q.correct_answer, explanation: q.explanation };
    }

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    const { data: attempt } = await supabase
      .from('quiz_attempts')
      .insert({
        enrollment_id: enrollment.id,
        content_id: contentId,
        answers, score, max_score: maxScore, percentage,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (percentage >= 70) {
      await supabase.from('training_progress').upsert({
        enrollment_id: enrollment.id, content_id: contentId,
        status: 'completed', completed_at: new Date().toISOString()
      }, { onConflict: 'enrollment_id,content_id' });
    }

    return NextResponse.json({ attempt: { id: attempt?.id, score, max_score: maxScore, percentage }, results });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 });
  }
}
