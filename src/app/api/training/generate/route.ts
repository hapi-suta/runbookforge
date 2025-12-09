import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic();

// POST - Generate training content with AI
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, topic, difficulty = 'intermediate', options = {} } = body;

    if (!type || !topic) {
      return NextResponse.json({ error: 'Type and topic required' }, { status: 400 });
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'quiz':
        systemPrompt = `You are an expert quiz creator for technical training. Create quiz questions that test understanding, not just memorization. Return valid JSON only.`;
        userPrompt = `Create a ${options.questionCount || 10}-question quiz about "${topic}" at ${difficulty} level.

Return JSON in this exact format:
{
  "title": "Quiz title",
  "description": "Brief description",
  "questions": [
    {
      "question_type": "mcq",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Why this is correct",
      "points": 1
    }
  ]
}

Include a mix of:
- Multiple choice (mcq)
- True/False (true_false)
- Multi-select where appropriate (multi_select with correct_answer as array)

Make questions progressively harder.`;
        break;

      case 'tutorial':
        systemPrompt = `You are an expert technical writer creating step-by-step tutorials. Be clear, practical, and include code examples where relevant. Return valid JSON only.`;
        userPrompt = `Create a comprehensive tutorial about "${topic}" for ${difficulty} level learners.

Return JSON:
{
  "title": "Tutorial title",
  "description": "What students will learn",
  "estimated_minutes": 30,
  "sections": [
    {
      "title": "Section title",
      "content": "Markdown content with code blocks",
      "key_points": ["Point 1", "Point 2"]
    }
  ],
  "prerequisites": ["Prerequisite 1"],
  "learning_objectives": ["Objective 1", "Objective 2"]
}`;
        break;

      case 'assignment':
        systemPrompt = `You are an expert instructor creating practical assignments. Focus on hands-on application of skills. Return valid JSON only.`;
        userPrompt = `Create a practical assignment about "${topic}" for ${difficulty} level students.

Return JSON:
{
  "title": "Assignment title",
  "description": "What students will build/do",
  "estimated_minutes": 60,
  "instructions": "Detailed markdown instructions",
  "requirements": ["Requirement 1", "Requirement 2"],
  "deliverables": ["What to submit"],
  "rubric": [
    {"criterion": "Criterion 1", "points": 25, "description": "How to earn these points"}
  ],
  "hints": ["Hint 1", "Hint 2"],
  "bonus_challenges": ["Extra challenge for advanced students"]
}`;
        break;

      case 'interview_prep':
        systemPrompt = `You are an expert interview coach. Create realistic interview questions with detailed guidance. Return valid JSON only.`;
        userPrompt = `Create interview preparation material for "${topic}" at ${difficulty} level.

Return JSON:
{
  "title": "Interview Prep: ${topic}",
  "description": "Prepare for ${topic} interviews",
  "estimated_minutes": 45,
  "questions": [
    {
      "question": "Interview question",
      "category": "technical|behavioral|system_design",
      "difficulty": "easy|medium|hard",
      "key_points": ["What interviewer looks for"],
      "sample_answer": "A strong answer would include...",
      "follow_ups": ["Possible follow-up questions"]
    }
  ],
  "tips": ["General interview tips"],
  "common_mistakes": ["Mistakes to avoid"]
}`;
        break;

      case 'challenge':
        systemPrompt = `You are an expert creating coding/technical challenges. Make them engaging and educational. Return valid JSON only.`;
        userPrompt = `Create a technical challenge about "${topic}" for ${difficulty} level.

Return JSON:
{
  "title": "Challenge title",
  "description": "Challenge overview",
  "estimated_minutes": 90,
  "scenario": "Real-world scenario description",
  "objectives": ["What to accomplish"],
  "constraints": ["Rules and limitations"],
  "starter_code": "// Optional starter code",
  "test_cases": [
    {"input": "Input", "expected_output": "Output", "explanation": "Why"}
  ],
  "hints": ["Progressive hints"],
  "solution_approach": "High-level solution explanation"
}`;
        break;

      case 'presentation':
        systemPrompt = `You are an expert at creating professional training presentations. Create engaging slides with clear, concise content. Return valid JSON only.`;
        userPrompt = `Create a presentation about "${topic}" for ${difficulty} level audience.

Return JSON:
{
  "title": "Presentation title",
  "description": "What this presentation covers",
  "estimated_minutes": 30,
  "slides": [
    {
      "title": "Slide title",
      "content": "Main content (use bullet points with - prefix)",
      "speaker_notes": "What the presenter should say",
      "type": "title|content|code|diagram|summary"
    }
  ],
  "learning_objectives": ["What audience will learn"],
  "key_takeaways": ["Main points to remember"]
}

Create 8-12 slides including:
1. Title slide
2. Agenda/Overview
3-9. Main content slides
10. Summary/Key Takeaways
11. Q&A slide

Make content concise - bullet points, not paragraphs.`;
        break;

      case 'runbook':
        systemPrompt = `You are an expert at creating operational runbooks and technical procedures. Create clear, step-by-step instructions. Return valid JSON only.`;
        userPrompt = `Create a runbook/procedure for "${topic}" at ${difficulty} level.

Return JSON:
{
  "title": "Runbook title",
  "description": "What this runbook covers",
  "estimated_minutes": 20,
  "prerequisites": ["What's needed before starting"],
  "steps": [
    {
      "title": "Step title",
      "description": "What this step accomplishes",
      "instructions": "Detailed instructions in markdown",
      "commands": ["command1", "command2"],
      "expected_output": "What you should see",
      "troubleshooting": "What to do if it fails"
    }
  ],
  "verification": "How to verify success",
  "rollback": "How to undo if needed"
}`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const textContent = response.content.find(b => b.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
    }

    // Parse JSON response
    let content;
    try {
      let jsonText = textContent.text.trim();
      // Remove markdown code blocks if present
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      content = JSON.parse(jsonText);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      return NextResponse.json({ 
        error: 'Failed to parse generated content',
        raw: textContent.text 
      }, { status: 500 });
    }

    return NextResponse.json({
      type,
      topic,
      difficulty,
      content
    });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
