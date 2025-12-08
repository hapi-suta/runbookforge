import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';
import { generatePPTXBuffer, PresentationData } from '@/lib/pptx-generator';

const anthropic = new Anthropic();

// POST - Generate PPT structure using AI
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { topic, style = 'workshop', slideCount = 14, additionalContext = '', generateFile = true, organization = '' } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const systemPrompt = `You are an expert presentation designer creating professional enterprise training presentations.

OUTPUT FORMAT: Return a JSON object with this structure:
{
  "title": "Main presentation title",
  "subtitle": "Training subtitle or tagline",
  "author": "Author name",
  "organization": "Organization name",
  "slides": [array of slide objects]
}

AVAILABLE SLIDE LAYOUTS (use these exactly):

1. "title" - Opening slide
   Required: title, subtitle, content (topic keywords separated by " • ")

2. "agenda" - Two-column numbered list
   Required: title, leftColumn, rightColumn
   Format: { "title": "Agenda Title", "items": [{"title": "Item text"}, ...] }

3. "pain-points" - Red warning cards (for challenges/problems)
   Required: title, items
   Format: [{"title": "Issue name", "description": "Details", "type": "danger"}, ...]

4. "two-column" - Benefits vs Considerations
   Required: title, leftColumn (benefits), rightColumn (considerations), optional keyInsight
   Format: leftColumn/rightColumn: { "title": "BENEFITS", "items": [{"title": "Benefit", "description": "Detail"}, ...] }
   keyInsight: { "title": "KEY INSIGHT", "content": "Important point" }

5. "comparison" - Before/After or Challenges/Solutions columns
   Required: title, leftColumn, rightColumn
   Format: leftColumn: { "title": "CHALLENGES", "items": [{"title": "Challenge text"}, ...] }
   rightColumn: { "title": "SOLUTIONS", "items": [{"title": "Solution text"}, ...] }

6. "three-column" - Category columns (great for security, architecture layers)
   Required: title, columns, optional keyInsight
   Format: columns: [{ "title": "Category Name", "items": ["Item 1", "Item 2", ...] }, ...]

7. "table" - Comparison table
   Required: title, tableData
   Format: tableData: { "headers": ["", "Option 1", "Option 2", ...], "rows": [["Feature", "Value", "Value", ...], ...] }
   Use ✓ for recommended, ✗ for not recommended

8. "problems" - Problem → Solution pairs (for troubleshooting)
   Required: title, problems
   Format: [{ "problem": "Problem description", "solution": "Solution description" }, ...]

9. "operations" - Day-2 operations with commands
   Required: title, operations
   Format: [{ "title": "Operation name", "description": "What it does", "command": "kubectl command" }, ...]

10. "content" - Generic content cards
    Required: title, items, optional keyInsight
    Format: [{ "title": "Point", "description": "Details", "type": "success|warning|danger|info" }, ...]

11. "takeaways" - Key takeaways (navy background)
    Required: title, items
    Format: [{ "title": "Takeaway point" }, ...]

12. "questions" - Closing Q&A slide
    Required: title, optional subtitle, optional items (for resource links)
    Format items: [{ "title": "DOCS", "description": "example.com" }, ...]

RULES:
- Maximum 5-6 items per section/column
- Keep text concise (titles max 6 words, descriptions max 15 words)
- Use appropriate layouts for content type
- Include speakerNotes for presenter guidance
- First slide must be "title" layout
- Last slide should be "questions" layout
- Second-to-last should be "takeaways" layout

Return ONLY valid JSON.`;

    const userPrompt = `Create a ${slideCount}-slide ${style} presentation about: "${topic}"

${organization ? `Organization: ${organization}` : ''}
${additionalContext ? `Additional context: ${additionalContext}` : ''}

STRUCTURE FOR ${slideCount} SLIDES:
1. Title slide (layout: "title")
2. Agenda (layout: "agenda")
3-${slideCount - 2}. Content slides - use variety of layouts:
   - "pain-points" for challenges/problems
   - "two-column" for benefits vs considerations  
   - "comparison" for before/after transformations
   - "three-column" for categorized features (security, architecture)
   - "table" for feature comparisons
   - "problems" for troubleshooting guides
   - "operations" for commands/procedures
   - "content" for general information
${slideCount - 1}. Key Takeaways (layout: "takeaways")
${slideCount}. Questions (layout: "questions")

Match the professional quality of enterprise training presentations. Return ONLY JSON.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt
    });

    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
    }

    let presentationData: PresentationData;
    try {
      let jsonText = textContent.text.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      presentationData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json({ 
        error: 'Failed to parse presentation structure',
        rawContent: textContent.text 
      }, { status: 500 });
    }

    // Validate structure
    if (!presentationData.slides || !Array.isArray(presentationData.slides)) {
      return NextResponse.json({ error: 'Invalid presentation structure' }, { status: 500 });
    }

    // Set defaults
    presentationData.organization = presentationData.organization || organization || 'RunbookForge';
    presentationData.author = presentationData.author || 'RunbookForge';

    // Generate PPTX file
    let pptxBase64: string | undefined;
    if (generateFile) {
      try {
        const buffer = await generatePPTXBuffer(presentationData);
        pptxBase64 = buffer.toString('base64');
      } catch (pptxError) {
        console.error('PPTX generation error:', pptxError);
      }
    }

    const result = {
      title: presentationData.title || topic,
      subtitle: presentationData.subtitle,
      author: presentationData.author,
      organization: presentationData.organization,
      style,
      slideCount: presentationData.slides.length,
      slides: presentationData.slides,
      pptxBase64,
      createdAt: new Date().toISOString(),
      metadata: {
        model: 'claude-sonnet-4-20250514',
        tokensUsed: response.usage?.output_tokens || 0
      }
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in POST /api/ai/ppt:', error);
    return NextResponse.json({ 
      error: 'Failed to generate presentation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
