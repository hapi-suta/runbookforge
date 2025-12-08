import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are a senior DevOps/DBA engineer. Generate runbooks as PURE JSON - no markdown, no explanations, no text before or after.

CRITICAL: Your entire response must be valid JSON starting with { and ending with }. No other text allowed.

JSON Structure:
{
  "title": "Professional title",
  "description": "Brief description",
  "sections": [
    {
      "id": "sec_001",
      "title": "Section title",
      "blocks": [
        {
          "id": "blk_001",
          "type": "step|code|warning|info|table|checklist",
          "title": "For steps: action title",
          "content": "Main content text",
          "language": "For code: bash|sql|yaml|json|python",
          "tags": ["All Nodes", "Primary Only"],
          "tableData": {"headers": ["Col1", "Col2"], "rows": [["val1", "val2"]]}
        }
      ]
    }
  ]
}

BLOCK TYPES:
- step: Numbered procedure with title and content
- code: Commands/scripts with language field
- warning: Critical cautions (use sparingly)
- info: Helpful tips
- table: Data with tableData field containing headers and rows arrays

TABLE FORMAT (IMPORTANT):
{
  "type": "table",
  "tableData": {
    "headers": ["Requirement", "Value"],
    "rows": [
      ["Operating System", "Ubuntu 22.04"],
      ["RAM", "4GB minimum"],
      ["Port", "5432"]
    ]
  }
}

GUIDELINES:
- Create 5-12 logical sections
- Use realistic commands and examples
- Include verification steps
- Add troubleshooting section
- Make it production-ready

Remember: Output ONLY the JSON object. No markdown. No explanations. Start with { end with }.`

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
    const { topic, details } = body

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    if (topic.length < 3) {
      return NextResponse.json({ error: 'Topic is too short' }, { status: 400 })
    }

    if (topic.length > 1000) {
      return NextResponse.json({ error: 'Topic is too long (max 1000 characters)' }, { status: 400 })
    }

    // Limit details length to prevent overly complex prompts
    const limitedDetails = details ? details.substring(0, 2000) : ''

    const prompt = limitedDetails 
      ? `Create a comprehensive, production-ready runbook for: ${topic}

User's environment and requirements:
${limitedDetails}

Generate a detailed runbook tailored to these specific needs. Include realistic examples using the details provided (server names, IPs, paths, etc. if mentioned).`
      : `Create a comprehensive, production-ready runbook for: ${topic}

Generate a detailed runbook with realistic examples, best practices, and common troubleshooting steps.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16384,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      system: SYSTEM_PROMPT,
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    
    let runbookData
    try {
      // Try to extract JSON from various formats
      let jsonStr = responseText.trim()
      
      // Remove markdown code blocks if present
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim()
      }
      
      // Remove any leading/trailing text before/after JSON
      const jsonStart = jsonStr.indexOf('{')
      const jsonEnd = jsonStr.lastIndexOf('}')
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonStr = jsonStr.slice(jsonStart, jsonEnd + 1)
      }
      
      runbookData = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText.substring(0, 500))
      return NextResponse.json({ 
        error: 'Failed to parse AI response. Try a simpler topic or shorter description.' 
      }, { status: 500 })
    }

    if (!runbookData.title || !runbookData.sections || !Array.isArray(runbookData.sections)) {
      return NextResponse.json({ 
        error: 'Invalid runbook structure generated. Please try again.' 
      }, { status: 500 })
    }

    return NextResponse.json(runbookData)

  } catch (error) {
    console.error('AI Generate error:', error)
    
    if (error instanceof Anthropic.APIError) {
      if (error.status === 429) {
        return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 })
      }
      return NextResponse.json({ error: 'AI service error. Please try again.' }, { status: 500 })
    }
    
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
