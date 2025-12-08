import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

interface GenerateRequest {
  type: 'presentation' | 'runbook' | 'quiz' | 'assignment' | 'challenge' | 'interview_prep';
  topic: string;
  context?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  options?: {
    slideCount?: number;
    questionCount?: number;
  };
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: GenerateRequest = await request.json();
    const { type, topic, context = '', difficulty = 'intermediate', options = {} } = body;

    if (!type || !topic) {
      return NextResponse.json({ error: 'Type and topic are required' }, { status: 400 });
    }

    const prompts: Record<string, string> = {
      presentation: `Create a ${options.slideCount || 15}-slide technical presentation on "${topic}". ${context}
Return JSON: {"title":"","slides":[{"title":"","layout":"title|content|section|bullets","content":"","speakerNotes":""}]}`,
      
      runbook: `Create a ${difficulty} runbook on "${topic}". ${context}
Return JSON: {"title":"","description":"","sections":[{"title":"","blocks":[{"type":"text|code|warning|tip","content":""}]}]}`,
      
      quiz: `Create ${options.questionCount || 10} ${difficulty} quiz questions on "${topic}". ${context}
Return JSON: {"title":"","questions":[{"type":"mcq","question":"","options":[{"id":"a","text":"","isCorrect":false}],"explanation":""}]}`,
      
      assignment: `Create a ${difficulty} assignment on "${topic}". ${context}
Return JSON: {"title":"","description":"","requirements":[{"description":"","points":20}],"rubric":[{"criteria":"","maxPoints":25}]}`,
      
      challenge: `Create a ${difficulty} hands-on challenge on "${topic}". ${context}
Return JSON: {"title":"","scenario":"","objectives":[],"successCriteria":[],"solution":{"approach":"","steps":[]}}`,
      
      interview_prep: `Create ${options.questionCount || 10} ${difficulty} interview questions on "${topic}". ${context}
Return JSON: {"title":"","questions":[{"category":"conceptual","question":"","keyPoints":[],"sampleAnswer":""}]}`
    };

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompts[type] + '\nReturn only valid JSON.' }]
    });

    const textContent = message.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') throw new Error('No response');

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');

    return NextResponse.json({ type, topic, content: JSON.parse(jsonMatch[0]) });
  } catch (error) {
    console.error('Error generating:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
