import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

// POST - Generate PPT structure using AI
export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { topic, style = 'workshop', slideCount = 15, additionalContext = '' } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const styleGuides: Record<string, string> = {
      workshop: `Create an interactive workshop presentation with:
        - Hands-on exercises and labs
        - Step-by-step instructions
        - Practice scenarios
        - Clear learning objectives
        - Technical depth with practical examples`,
      training: `Create a comprehensive training presentation with:
        - Module-based structure
        - Theory followed by practical application
        - Assessment checkpoints
        - Key takeaways per section
        - Progressive difficulty`,
      overview: `Create a high-level overview presentation with:
        - Executive summary style
        - Key concepts and benefits
        - Architecture diagrams (describe them)
        - Use cases and examples
        - Clear value proposition`,
      technical: `Create a deep technical presentation with:
        - Detailed architecture explanations
        - Code examples and configurations
        - Best practices and patterns
        - Troubleshooting guides
        - Performance considerations`
    };

    const systemPrompt = `You are an expert presentation designer specializing in technical content. Create professional, visually-oriented slide content.

For each slide, provide:
1. title: Clear, concise title (max 8 words)
2. layout: One of: "title", "content", "two-column", "image-text", "bullets", "code", "diagram", "quote"
3. content: Main content (be concise, use bullet points where appropriate)
4. speakerNotes: What the presenter should say (2-3 sentences)
5. visualSuggestion: Description of any diagram, chart, or visual element

IMPORTANT RULES:
- Keep text minimal - presentations are visual, not documents
- Maximum 5-6 bullet points per slide
- Each bullet should be 1-2 lines max
- Use concrete examples and real-world scenarios
- Include code snippets where relevant (keep them short, 5-10 lines max)
- For diagrams, describe what should be shown clearly

Output as JSON array of slide objects.`;

    const userPrompt = `Create a ${slideCount}-slide presentation about: "${topic}"

Style: ${styleGuides[style] || styleGuides.workshop}

${additionalContext ? `Additional context: ${additionalContext}` : ''}

Structure the presentation with:
1. Title slide
2. Agenda/Overview slide
3. Main content slides (organized logically)
4. Summary/Key Takeaways slide
5. Q&A or Next Steps slide

Return ONLY a valid JSON array, no markdown formatting.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ],
      system: systemPrompt
    });

    // Extract text content
    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
    }

    // Parse JSON response
    let slides;
    try {
      // Clean up the response - remove markdown code blocks if present
      let jsonText = textContent.text.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      slides = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', textContent.text);
      return NextResponse.json({ 
        error: 'Failed to parse presentation structure',
        rawContent: textContent.text 
      }, { status: 500 });
    }

    // Generate presentation metadata
    const presentation = {
      title: topic,
      style,
      slideCount: slides.length,
      slides,
      createdAt: new Date().toISOString(),
      metadata: {
        model: 'claude-sonnet-4-20250514',
        tokensUsed: response.usage?.output_tokens || 0
      }
    };

    return NextResponse.json(presentation);

  } catch (error) {
    console.error('Error in POST /api/ai/ppt:', error);
    return NextResponse.json({ 
      error: 'Failed to generate presentation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
