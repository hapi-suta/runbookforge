import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are a technical documentation expert specializing in creating comprehensive, production-ready runbooks. Generate a detailed runbook for the given topic.

Output ONLY valid JSON with this exact structure:
{
  "title": "string - professional title",
  "description": "string - brief description",
  "sections": [
    {
      "id": "string - unique id like 'sec_abc123'",
      "title": "string - section title",
      "blocks": [
        {
          "id": "string - unique id like 'blk_xyz789'",
          "type": "step|code|warning|info|table|checklist",
          "title": "string - for steps: clear action title",
          "content": "string - main content",
          "language": "string - for code: bash|sql|yaml|json|python",
          "tags": ["string"] - e.g., 'All Nodes', 'Primary', 'Each Node',
          "tableData": { "headers": ["Label"], "rows": [["Value"]] } - for specification tables
        }
      ]
    }
  ]
}

STRUCTURE REQUIREMENTS:
1. Start with "Prerequisites" section containing:
   - An "info" block with overview
   - A numbered "step" for each prerequisite group
   - A "table" for specifications (OS, CPU, RAM, Storage, Network)

2. Create 4-8 logical sections (e.g., Prerequisites, Installation, Configuration, Verification)

3. Each section should have:
   - 2-6 numbered steps (type: "step") with clear titles
   - Code blocks AFTER steps they relate to (not inside steps)
   - Combine related commands in ONE code block with comments

4. Step format:
   - title: Short action phrase ("Set Hostnames", "Install Packages")
   - content: Brief explanation of what this step does
   - tags: Where to run it ["All Nodes", "Primary Only", etc.]

5. Code block format:
   - Combine ALL related commands in ONE block
   - Use comments to separate sections:
     # On patroni-atl-01:
     sudo hostnamectl set-hostname patroni-atl-01
     
     # On patroni-atl-02:
     sudo hostnamectl set-hostname patroni-atl-02
   - tags: Same as the step it follows

6. Use tables for:
   - Server specifications (vertical format)
   - Server inventory (horizontal with IP, Role, etc.)
   - Configuration reference

7. Add "warning" blocks before dangerous operations only

8. End with "Verification" section with test commands

QUALITY STANDARDS:
- Realistic commands with proper syntax
- Placeholder values clearly marked: <your-value>
- Comments explaining complex commands
- Proper error handling examples

Output ONLY the JSON, no markdown.`

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
      ? `Create a comprehensive runbook for: ${topic}\n\nAdditional details: ${details}`
      : `Create a comprehensive runbook for: ${topic}`

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
