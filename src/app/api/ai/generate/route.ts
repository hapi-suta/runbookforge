import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are a senior DevOps/DBA engineer creating production-ready runbooks. Generate detailed, actionable documentation.

Output ONLY valid JSON with this structure:
{
  "title": "Professional title",
  "description": "Brief description",
  "sections": [
    {
      "id": "sec_xxx",
      "title": "Section title",
      "blocks": [
        {
          "id": "blk_xxx",
          "type": "step|code|warning|info|table|checklist",
          "title": "For steps: action title",
          "content": "Main content",
          "language": "For code: bash|sql|yaml|json|python",
          "tags": ["All Nodes", "Primary", "Each Node"]
        }
      ]
    }
  ]
}

CONTENT GUIDELINES:

1. SECTIONS (create 5-10 logical sections):
   - Prerequisites / Requirements
   - Installation / Setup
   - Configuration
   - Verification / Testing
   - Operations / Maintenance
   - Troubleshooting
   - Backup & Recovery (if applicable)

2. STEP BLOCKS (numbered procedures):
   - Clear, actionable title: "Install PostgreSQL 15", "Configure pg_hba.conf"
   - Brief explanation in content
   - Add tags: "All Nodes", "Primary Only", "Replica", "Each Node"

3. CODE BLOCKS (realistic commands):
   - Group related commands together with comments
   - Use realistic values from user's context if provided
   - Include verification commands after important operations
   - Format:
     # Comment explaining this section
     command1
     command2

4. WARNING BLOCKS: Only for genuinely dangerous operations

5. INFO BLOCKS: Helpful tips, not obvious information

6. TABLE BLOCKS: For specifications, use format:
   {"headers": ["Property", "Value"], "rows": [["OS", "Ubuntu 22.04"], ["RAM", "8GB"]]}

QUALITY STANDARDS:
- Use realistic server names, IPs, paths from user context
- Include error handling and verification steps
- Add common troubleshooting scenarios
- Make it copy-paste ready for production use

Output ONLY the JSON, no markdown wrapping.`

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

    if (topic.length > 500) {
      return NextResponse.json({ error: 'Topic is too long' }, { status: 400 })
    }

    const prompt = details 
      ? `Create a comprehensive, production-ready runbook for: ${topic}

User's environment and requirements:
${details}

Generate a detailed runbook tailored to these specific needs. Include realistic examples using the details provided (server names, IPs, paths, etc. if mentioned).`
      : `Create a comprehensive, production-ready runbook for: ${topic}

Generate a detailed runbook with realistic examples, best practices, and common troubleshooting steps.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
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
