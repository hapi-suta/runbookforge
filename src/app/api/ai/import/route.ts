import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are a technical documentation expert. Your task is to convert unstructured text into a well-organized runbook format.

Output ONLY valid JSON with this exact structure:
{
  "title": "string - a clear, concise title for the runbook",
  "description": "string - brief description of what this runbook covers",
  "sections": [
    {
      "id": "string - unique id like 'sec_abc123'",
      "title": "string - section title",
      "blocks": [
        {
          "id": "string - unique id like 'blk_xyz789'",
          "type": "step|code|warning|info|note|header|table|checklist",
          "title": "string - optional, for steps and headers",
          "content": "string - the main content",
          "language": "string - optional, for code blocks: bash|sql|yaml|json|python",
          "tags": ["string"] - optional, relevant tags like 'Primary', 'Production', 'Critical',
          "tableData": { "headers": ["string"], "rows": [["string"]] } - optional, for tables,
          "checklist": [{"id": "string", "text": "string", "checked": false}] - optional, for checklists
        }
      ]
    }
  ]
}

Guidelines:
1. Group related steps into logical sections
2. Use "step" blocks for actionable instructions
3. Use "code" blocks for commands, scripts, SQL, config files
4. Use "warning" blocks for critical cautions and potential issues
5. Use "info" blocks for helpful tips and context
6. Use "header" blocks for major section introductions
7. Use "table" blocks for server inventories, port references, comparisons
8. Use "checklist" blocks for verification steps or prerequisites
9. Add relevant tags to steps (e.g., "Primary", "Replica", "All Servers", "Production")
10. Extract code snippets and set appropriate language
11. Preserve technical accuracy - don't modify commands or values
12. Create clear, actionable step titles

Output ONLY the JSON, no markdown, no explanation.`

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { text } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text content is required' }, { status: 400 })
    }

    if (text.length > 50000) {
      return NextResponse.json({ error: 'Text too long. Maximum 50,000 characters.' }, { status: 400 })
    }

    if (text.length < 50) {
      return NextResponse.json({ error: 'Text too short. Please provide more content.' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: `Convert the following documentation/text into a structured runbook:\n\n${text}`
        }
      ],
      system: SYSTEM_PROMPT,
    })

    // Extract text from response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    
    // Parse JSON from response
    let runbookData
    try {
      // Try to extract JSON if wrapped in markdown code blocks
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                        responseText.match(/```\s*([\s\S]*?)\s*```/)
      const jsonStr = jsonMatch ? jsonMatch[1] : responseText
      runbookData = JSON.parse(jsonStr.trim())
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText)
      return NextResponse.json({ 
        error: 'Failed to parse AI response. Please try again.' 
      }, { status: 500 })
    }

    // Validate structure
    if (!runbookData.title || !runbookData.sections || !Array.isArray(runbookData.sections)) {
      return NextResponse.json({ 
        error: 'Invalid runbook structure generated. Please try again.' 
      }, { status: 500 })
    }

    return NextResponse.json(runbookData)

  } catch (error) {
    console.error('AI Import error:', error)
    
    if (error instanceof Anthropic.APIError) {
      if (error.status === 429) {
        return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 })
      }
      return NextResponse.json({ error: 'AI service error. Please try again.' }, { status: 500 })
    }
    
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
