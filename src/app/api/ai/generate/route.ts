import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'

// Prevent static rendering - this route uses auth headers
export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are a senior DevOps/DBA engineer creating visually rich, professional runbooks. Generate PURE JSON only - no markdown, no text before or after.

Your entire response must be valid JSON starting with { and ending with }.

JSON Structure:
{
  "title": "Professional title",
  "description": "Brief description",
  "sections": [
    {
      "id": "sec_001",
      "title": "Section title",
      "blocks": [ ...blocks ]
    }
  ]
}

AVAILABLE BLOCK TYPES:

1. STEP - Numbered action items
{
  "id": "blk_001",
  "type": "step",
  "title": "Install PostgreSQL",
  "content": "Brief explanation of what this step does",
  "tags": ["All Nodes"]
}

2. CODE - Commands and scripts
{
  "id": "blk_002",
  "type": "code",
  "content": "# Comment\\nsudo apt install postgresql-15",
  "language": "bash",
  "tags": ["Primary"]
}
IMPORTANT: Set "language" to the actual language of the code: "bash", "python", "sql", "yaml", "json", "javascript", "typescript", "go", "rust", "java", "ruby", "perl", "php", "powershell", "dockerfile", "terraform", "ansible", etc. Use the correct language for syntax highlighting.

3. INFO - Tips and context (blue box)
{
  "id": "blk_003",
  "type": "info",
  "content": "Important tip or context information"
}

4. WARNING - Critical cautions (amber box)
{
  "id": "blk_004",
  "type": "warning",
  "content": "Critical warning message"
}

5. SERVERTABLE - Server inventory with colored role badges
{
  "id": "blk_005",
  "type": "servertable",
  "servers": [
    {"hostname": "db-atl-01", "role": "Primary", "roleColor": "green", "ip": "10.0.1.10", "region": "Atlanta (ATL)", "components": "PostgreSQL 15, Patroni, HAProxy"},
    {"hostname": "db-atl-02", "role": "Standby", "roleColor": "blue", "ip": "10.0.1.11", "region": "Atlanta (ATL)", "components": "PostgreSQL 15, Patroni, HAProxy"},
    {"hostname": "db-dfw-01", "role": "DR Replica", "roleColor": "orange", "ip": "10.0.2.10", "region": "Dallas (DFW)", "components": "PostgreSQL 15, Patroni"}
  ]
}
Colors: green, blue, teal, orange, amber, red, violet, pink

6. INFOCARDS - Directory structure / info grid with colors
{
  "id": "blk_006",
  "type": "infocards",
  "infocards": [
    {"title": "DATA", "content": "/opt/pgsql/data", "color": "red"},
    {"title": "LOG", "content": "/opt/pgsql/log", "color": "orange"},
    {"title": "WAL", "content": "/opt/pgsql/wal", "color": "green"},
    {"title": "BACKUP", "content": "/opt/pgsql/backup", "color": "blue"}
  ]
}

7. PORTREF - Port reference grid
{
  "id": "blk_007",
  "type": "portref",
  "ports": [
    {"name": "PostgreSQL", "port": "5432", "color": "teal"},
    {"name": "HAProxy R/W", "port": "5000", "color": "green"},
    {"name": "HAProxy R/O", "port": "5001", "color": "blue"},
    {"name": "Patroni API", "port": "8008", "color": "amber"},
    {"name": "etcd Client", "port": "2379", "color": "violet"}
  ]
}

8. TWOCOLUMN - Side-by-side comparison
{
  "id": "blk_008",
  "type": "twocolumn",
  "leftTitle": "Primary Datacenter (Atlanta)",
  "leftColor": "emerald",
  "leftContent": "<ul><li><strong>patroni-atl-01</strong> - Primary PostgreSQL</li><li><strong>patroni-atl-02</strong> - Sync Standby</li></ul>",
  "rightTitle": "DR Site (Dallas)",
  "rightColor": "amber",
  "rightContent": "<ul><li><strong>patroni-dfw-01</strong> - Async Replica</li><li>WAN Replication (~20ms)</li></ul>"
}

9. TABLE - Data tables with rows/columns
{
  "id": "blk_009",
  "type": "table",
  "tableData": {
    "headers": ["Requirement", "Value"],
    "rows": [
      ["Operating System", "Ubuntu 22.04 LTS"],
      ["RAM", "8GB minimum"],
      ["Storage", "100GB SSD"]
    ]
  }
}

10. FLOWCARDS - Traffic flow diagrams
{
  "id": "blk_010",
  "type": "flowcards",
  "flows": [
    {"flow": "App → HAProxy :5000 → Primary :5432", "color": "teal"},
    {"flow": "Primary ↔ etcd :2379 ↔ Standby", "color": "amber"},
    {"flow": "All Nodes → pgBackRest → S3", "color": "violet"}
  ]
}

RUNBOOK STRUCTURE GUIDELINES:

Section 1: Overview
- Use TWOCOLUMN for architecture overview (e.g., Primary DC vs DR Site)
- Use SERVERTABLE for server inventory
- Use INFOCARDS for directory structure
- Use PORTREF for port reference

Section 2-N: Procedures
- Use STEP + CODE blocks for procedures
- Use WARNING before dangerous operations
- Use INFO for helpful tips

Last Section: Verification/Troubleshooting
- Use STEP blocks for verification commands
- Use TABLE for troubleshooting reference

IMPORTANT: Create visually rich runbooks! Don't just use step/code blocks. Include:
- Server tables with colored role badges
- Info cards for directories/paths
- Port reference grids
- Two-column layouts for comparisons
- Flow cards for traffic patterns

Output ONLY the JSON object. Start with { end with }.`

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
