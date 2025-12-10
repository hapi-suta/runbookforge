import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';
import { POSTGRESQL_SYSTEM_PROMPT, getAIPrompt } from '@/lib/ai-prompts';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const anthropic = new Anthropic();

// Unified AI endpoint for all AI features
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...params } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action required' }, { status: 400 });
    }

    let systemPrompt = '';
    let userPrompt = '';
    let maxTokens = 4000;

    switch (action) {
      // ==========================================
      // INSTRUCTOR: Content Creation
      // ==========================================
      
      case 'course_outline': {
        const { topic, targetAudience = 'intermediate', duration = '4 weeks' } = params;
        systemPrompt = `You are an expert curriculum designer. Create comprehensive course outlines with logical progression. Return valid JSON only.`;
        userPrompt = `Create a complete course outline for "${topic}" targeting ${targetAudience} level learners, designed for ${duration}.

Return JSON:
{
  "title": "Course title",
  "description": "Course description",
  "target_audience": "${targetAudience}",
  "duration": "${duration}",
  "learning_objectives": ["Objective 1", "Objective 2"],
  "prerequisites": ["Prerequisite 1"],
  "chapters": [
    {
      "number": 1,
      "title": "Chapter title",
      "description": "What this chapter covers",
      "estimated_hours": 2,
      "modules": [
        {
          "title": "Module title",
          "description": "What students will learn",
          "content_types": ["presentation", "quiz", "assignment"],
          "topics": ["Topic 1", "Topic 2"]
        }
      ],
      "assessment": "How to assess this chapter"
    }
  ],
  "final_project": {
    "title": "Project title",
    "description": "What students will build",
    "requirements": ["Requirement 1"]
  }
}

Create 6-10 chapters with 2-4 modules each. Make the progression logical and comprehensive.`;
        maxTokens = 8000;
        break;
      }

      case 'quiz_from_content': {
        const { content, questionCount = 10, difficulty = 'intermediate' } = params;
        systemPrompt = `You are an expert quiz creator. Generate questions that test understanding based on the provided content. Return valid JSON only.`;
        userPrompt = `Based on this content, create ${questionCount} quiz questions at ${difficulty} level:

CONTENT:
${content}

Return JSON:
{
  "title": "Quiz title based on content",
  "questions": [
    {
      "question_type": "mcq",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A",
      "explanation": "Why this is correct, referencing the content",
      "points": 1
    }
  ]
}

Include mcq, true_false, and multi_select question types.`;
        break;
      }

      case 'flashcards': {
        const { topic, content, count = 20 } = params;
        systemPrompt = `You are an expert at creating effective flashcards for learning. Create cards that promote active recall. Return valid JSON only.`;
        userPrompt = `Create ${count} flashcards for learning about "${topic}".
${content ? `Based on this content:\n${content}` : ''}

Return JSON:
{
  "title": "Flashcard set title",
  "description": "What these flashcards cover",
  "cards": [
    {
      "front": "Question or term",
      "back": "Answer or definition",
      "hint": "Optional hint",
      "category": "Category/topic",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Make cards varied - include definitions, concepts, examples, and application questions.`;
        break;
      }

      case 'rubric': {
        const { assignment, maxPoints = 100, criteria = 4 } = params;
        systemPrompt = `You are an expert at creating fair, comprehensive grading rubrics. Return valid JSON only.`;
        userPrompt = `Create a grading rubric for this assignment: "${assignment}"

Total points: ${maxPoints}
Number of criteria: ${criteria}

Return JSON:
{
  "title": "Rubric for ${assignment}",
  "total_points": ${maxPoints},
  "criteria": [
    {
      "name": "Criterion name",
      "description": "What this criterion evaluates",
      "points": 25,
      "levels": [
        {"level": "Excellent", "points": "23-25", "description": "What excellent looks like"},
        {"level": "Good", "points": "18-22", "description": "What good looks like"},
        {"level": "Satisfactory", "points": "13-17", "description": "What satisfactory looks like"},
        {"level": "Needs Work", "points": "0-12", "description": "What needs improvement"}
      ]
    }
  ],
  "general_feedback_areas": ["Area 1", "Area 2"]
}`;
        break;
      }

      case 'improve_content': {
        const { content, instruction = 'make it clearer' } = params;
        systemPrompt = `You are an expert technical writer and editor. Improve content while preserving its meaning and technical accuracy.`;
        userPrompt = `Improve this content. Instruction: ${instruction}

CONTENT:
${content}

Return the improved content directly (not JSON). Keep the same format (markdown, code blocks, etc).`;
        maxTokens = 6000;
        // For this one, we won't parse as JSON
        break;
      }

      case 'speaker_notes': {
        const { slides } = params;
        systemPrompt = `You are an expert presenter creating speaker notes. Write natural, conversational notes that guide the presenter. Return valid JSON only.`;
        userPrompt = `Generate speaker notes for these slides:

${JSON.stringify(slides, null, 2)}

Return JSON:
{
  "slides": [
    {
      "slide_number": 1,
      "title": "Slide title",
      "speaker_notes": "What to say (2-3 paragraphs, conversational)",
      "timing": "2 minutes",
      "transitions": "How to transition to next slide",
      "emphasis_points": ["Key point to emphasize"]
    }
  ],
  "general_tips": ["Tip 1", "Tip 2"]
}`;
        maxTokens = 6000;
        break;
      }

      case 'translate': {
        const { content, targetLanguage, sourceLanguage = 'English' } = params;
        systemPrompt = `You are an expert translator. Translate accurately while preserving technical terms and formatting.`;
        userPrompt = `Translate this content from ${sourceLanguage} to ${targetLanguage}:

${content}

Keep all markdown formatting, code blocks, and technical terms. Return only the translated content.`;
        maxTokens = 8000;
        break;
      }

      case 'video_script': {
        const { topic, duration = '10 minutes', style = 'educational' } = params;
        systemPrompt = `You are an expert video script writer. Create engaging, well-paced scripts. Return valid JSON only.`;
        userPrompt = `Create a ${duration} ${style} video script about "${topic}".

Return JSON:
{
  "title": "Video title",
  "description": "Video description for thumbnail",
  "duration": "${duration}",
  "script": [
    {
      "section": "intro|main|demo|summary|outro",
      "timestamp": "0:00",
      "duration": "30 seconds",
      "narration": "What to say (word for word)",
      "visual_notes": "What to show on screen",
      "b_roll": "Suggested B-roll footage"
    }
  ],
  "hooks": ["Attention-grabbing hooks for start"],
  "cta": "Call to action at the end",
  "keywords": ["SEO keywords"]
}`;
        maxTokens = 6000;
        break;
      }

      // ==========================================
      // STUDENT: Learning Assistance
      // ==========================================

      case 'tutor_chat': {
        const { question, context, conversationHistory = [] } = params;
        systemPrompt = `You are a friendly, expert tutor helping students learn. Explain concepts clearly, use analogies, and encourage questions. Be patient and supportive.

${context ? `Course context:\n${context}` : ''}

Guide students to understand, don't just give answers. Use the Socratic method when appropriate.`;
        
        const messages = [
          ...conversationHistory.map((msg: { role: string; content: string }) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          })),
          { role: 'user' as const, content: question }
        ];

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          system: systemPrompt,
          messages
        });

        const textContent = response.content.find(b => b.type === 'text');
        return NextResponse.json({
          response: textContent?.type === 'text' ? textContent.text : 'Sorry, I could not generate a response.',
          action: 'tutor_chat'
        });
      }

      case 'explain_simple': {
        const { concept, level = 'beginner' } = params;
        systemPrompt = `You are an expert at explaining complex topics simply. Use analogies, examples, and everyday language.`;
        userPrompt = `Explain "${concept}" like I'm a ${level === 'eli5' ? '5-year-old' : level === 'beginner' ? 'complete beginner' : 'someone unfamiliar with the topic'}.

Use:
- Simple analogies
- Real-world examples
- Short sentences
- No jargon (or explain it immediately)

Format with headers and bullet points for clarity.`;
        break;
      }

      case 'quiz_me': {
        const { topic, difficulty = 'intermediate', count = 5 } = params;
        systemPrompt = `You are a quiz master creating practice questions. Make them educational and give helpful feedback. Return valid JSON only.`;
        userPrompt = `Create ${count} practice questions about "${topic}" at ${difficulty} level.

Return JSON:
{
  "topic": "${topic}",
  "questions": [
    {
      "question": "Question text",
      "type": "mcq|short_answer|true_false",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A",
      "hint": "A helpful hint",
      "explanation": "Why this is correct and what to learn",
      "related_concept": "What to review if wrong"
    }
  ]
}`;
        break;
      }

      case 'summarize': {
        const { content, length = 'medium' } = params;
        const wordCount = length === 'short' ? '100' : length === 'long' ? '400' : '200';
        systemPrompt = `You are an expert at creating clear, comprehensive summaries. Capture key points without losing important details.`;
        userPrompt = `Summarize this content in about ${wordCount} words:

${content}

Include:
- Main concepts
- Key takeaways
- Any important warnings or notes

Format with bullet points for easy scanning.`;
        break;
      }

      case 'study_guide': {
        const { topic, content, examType = 'comprehensive' } = params;
        systemPrompt = `You are an expert at creating effective study guides. Focus on what's most important to know. Return valid JSON only.`;
        userPrompt = `Create a study guide for "${topic}" for a ${examType} exam.
${content ? `Based on this content:\n${content}` : ''}

Return JSON:
{
  "title": "Study Guide: ${topic}",
  "summary": "Brief overview",
  "key_concepts": [
    {
      "concept": "Concept name",
      "definition": "Clear definition",
      "importance": "Why this matters",
      "example": "Concrete example",
      "common_mistakes": "What students often get wrong"
    }
  ],
  "formulas_or_rules": ["Formula or rule to memorize"],
  "practice_questions": [
    {"question": "Q", "answer": "A"}
  ],
  "mnemonics": ["Memory aids"],
  "connections": "How concepts relate to each other",
  "exam_tips": ["Tips for the exam"]
}`;
        maxTokens = 6000;
        break;
      }

      case 'knowledge_gaps': {
        const { quizResults, topic } = params;
        systemPrompt = `You are an expert learning analyst. Identify knowledge gaps and provide actionable recommendations. Return valid JSON only.`;
        userPrompt = `Analyze these quiz results for "${topic}" and identify knowledge gaps:

${JSON.stringify(quizResults, null, 2)}

Return JSON:
{
  "overall_score": 75,
  "strengths": [
    {"area": "Area name", "evidence": "What shows this is a strength"}
  ],
  "gaps": [
    {
      "area": "Area needing work",
      "severity": "high|medium|low",
      "evidence": "Questions missed that show this gap",
      "recommendation": "What to study",
      "resources": ["Suggested resource type"]
    }
  ],
  "priority_order": ["Gap to address first", "Then this"],
  "study_plan": "Recommended approach",
  "encouragement": "Positive message"
}`;
        break;
      }

      case 'explain_code': {
        const { code, language = 'auto-detect' } = params;
        systemPrompt = `You are an expert programmer and teacher. Explain code clearly with line-by-line breakdowns when helpful.`;
        userPrompt = `Explain this ${language !== 'auto-detect' ? language : ''} code:

\`\`\`
${code}
\`\`\`

Include:
1. What the code does overall
2. Line-by-line explanation (for complex parts)
3. Key concepts used
4. Potential improvements or alternatives
5. Common pitfalls

Use clear, beginner-friendly language but be technically accurate.`;
        break;
      }

      // ==========================================
      // PLATFORM: Smart Features
      // ==========================================

      case 'auto_tag': {
        const { content, title } = params;
        systemPrompt = `You are an expert at categorizing and tagging educational content. Return valid JSON only.`;
        userPrompt = `Analyze this content and suggest tags/categories:

Title: ${title}
Content: ${content}

Return JSON:
{
  "primary_category": "Main category",
  "subcategory": "Subcategory",
  "tags": ["tag1", "tag2", "tag3"],
  "difficulty": "beginner|intermediate|advanced",
  "content_type": "theory|practical|reference|exercise",
  "estimated_time_minutes": 30,
  "prerequisites": ["What learners should know first"],
  "learning_outcomes": ["What learners will gain"]
}`;
        break;
      }

      case 'progress_insights': {
        const { progress, courseStructure } = params;
        systemPrompt = `You are a learning analytics expert. Provide personalized insights and recommendations. Return valid JSON only.`;
        userPrompt = `Analyze this student's progress and provide insights:

Progress Data:
${JSON.stringify(progress, null, 2)}

Course Structure:
${JSON.stringify(courseStructure, null, 2)}

Return JSON:
{
  "summary": "Brief progress summary",
  "completion_percentage": 65,
  "estimated_completion": "2 weeks at current pace",
  "strengths": ["What they're doing well"],
  "areas_for_improvement": ["What needs attention"],
  "recommendations": [
    {
      "type": "content|pace|review",
      "suggestion": "What to do",
      "reason": "Why this helps",
      "priority": "high|medium|low"
    }
  ],
  "next_best_action": "What to do next",
  "motivation": "Encouraging message"
}`;
        break;
      }

      case 'recommend_next': {
        const { completed, available, learnerProfile } = params;
        systemPrompt = `You are an expert at personalizing learning paths. Return valid JSON only.`;
        userPrompt = `Recommend what this learner should do next:

Completed content:
${JSON.stringify(completed, null, 2)}

Available content:
${JSON.stringify(available, null, 2)}

Learner profile:
${JSON.stringify(learnerProfile, null, 2)}

Return JSON:
{
  "recommended": [
    {
      "content_id": "id",
      "title": "Content title",
      "reason": "Why this is recommended now",
      "confidence": 0.95
    }
  ],
  "learning_path": ["Suggested sequence"],
  "skip_suggestions": ["Content they might skip"],
  "personalization_notes": "Why these recommendations fit this learner"
}`;
        break;
      }

      case 'estimate_completion': {
        const { content, averageReadingSpeed = 200 } = params;
        systemPrompt = `You are an expert at estimating learning time. Be realistic about how long things take. Return valid JSON only.`;
        userPrompt = `Estimate how long this content will take to complete:

${content}

Consider:
- Reading time at ${averageReadingSpeed} words/minute
- Time to understand concepts
- Time for any exercises
- Buffer for re-reading complex parts

Return JSON:
{
  "estimated_minutes": 30,
  "breakdown": {
    "reading": 15,
    "comprehension": 10,
    "exercises": 5
  },
  "difficulty_factor": "This content is X% harder/easier than average",
  "tips": ["How to complete efficiently"]
}`;
        break;
      }

      case 'certificate_text': {
        const { studentName, courseName, completionDate, instructorName, achievements = [] } = params;
        systemPrompt = `You are an expert at creating professional certificate text. Be formal but warm.`;
        userPrompt = `Generate certificate text for:
- Student: ${studentName}
- Course: ${courseName}
- Completed: ${completionDate}
- Instructor: ${instructorName}
${achievements.length > 0 ? `- Special achievements: ${achievements.join(', ')}` : ''}

Return the certificate text in a formal, professional style suitable for printing. Include:
- Header text
- Main body
- Achievement notes (if any)
- Closing statement`;
        break;
      }

      // ==========================================
      // POSTGRESQL-SPECIFIC CONTENT GENERATION
      // ==========================================

      case 'generate_content': {
        const { topic, contentType, difficulty = 'intermediate' } = params;
        // Use the specialized PostgreSQL prompts
        const fullPrompt = getAIPrompt(topic, contentType, difficulty);
        systemPrompt = POSTGRESQL_SYSTEM_PROMPT;
        userPrompt = fullPrompt;
        maxTokens = 8000;
        break;
      }

      case 'high_class_presentation': {
        const { topic, audience = 'intermediate', slideCount = 10, includeCode = true } = params;
        systemPrompt = `You are an expert at creating high-class technical presentations and runbooks. 
${POSTGRESQL_SYSTEM_PROMPT}

Create visually stunning presentations with:
- Professional dark theme aesthetics
- Server architecture diagrams using comparison grids
- Code blocks with syntax highlighting
- Step-by-step instructions
- Alert boxes for important notes
- Tables for inventories and reference data
- Traffic flow diagrams
- Port and directory reference grids

Return valid JSON only.`;
        
        userPrompt = `Create a professional presentation about "${topic}" for ${audience} level audience.

Include approximately ${slideCount} slides with a mix of:
- Overview/architecture slide with comparison grid
- Server inventory table (if applicable)
- Directory structure and port reference grids
- Step-by-step setup instructions with code blocks
- Configuration file examples (use isConfig: true)
- Warning/info alerts for important notes
- Day-2 operations commands

Return JSON in this exact format:
{
  "title": "Presentation Title",
  "subtitle": "Subtitle",
  "badges": [
    { "label": "Technology", "color": "green|violet|sky|amber|orange|teal|emerald" }
  ],
  "slides": [
    {
      "title": "Slide Title",
      "subtitle": "Optional",
      "comparison": [
        { "title": "Option A", "items": ["Point 1"], "color": "emerald" },
        { "title": "Option B", "items": ["Point 1"], "color": "orange" }
      ],
      "code": {
        "content": "# bash commands",
        "language": "bash|yaml|sql|python",
        "runOn": "ALL Nodes",
        "isConfig": false
      },
      "alert": { "type": "info|warning|danger|success", "content": "Message" },
      "serverBadges": [{ "hostname": "server-01", "ip": "10.0.1.10", "role": "primary|standby|dr|etcd|app" }],
      "table": { "headers": ["Col1"], "rows": [["value"]] },
      "directories": [{ "title": "DATA", "path": "/path", "color": "emerald" }],
      "ports": [{ "label": "Service", "port": "5432", "color": "sky" }],
      "trafficFlow": [{ "label": "Client", "color": "teal" }, { "label": "Server", "color": "emerald" }],
      "steps": [{ "title": "Step", "description": "Desc", "code": "optional" }],
      "speakerNotes": "Notes for presenter"
    }
  ]
}

${includeCode ? 'Include detailed code examples and configuration files.' : 'Focus on concepts rather than code.'}

Make it visually impressive and technically accurate.`;
        maxTokens = 12000;
        break;
      }

      case 'runbook_presentation': {
        const { title, steps, servers, topic } = params;
        systemPrompt = `You are creating an operational runbook in presentation format. 
${POSTGRESQL_SYSTEM_PROMPT}

Create clear, step-by-step operational documentation with:
- Server badges showing which server to run commands on
- Code blocks with actual commands
- Warning alerts for dangerous operations
- Success alerts for verification steps
- Tables for reference data

Return valid JSON only.`;

        userPrompt = `Create a runbook presentation for: "${title}"
Topic: ${topic || 'Database Operations'}
${servers ? `Servers involved: ${JSON.stringify(servers)}` : ''}
${steps ? `Key steps to cover: ${JSON.stringify(steps)}` : ''}

Return JSON format:
{
  "title": "${title}",
  "subtitle": "Operational Runbook",
  "badges": [{ "label": "Runbook", "color": "amber" }],
  "slides": [
    {
      "title": "Step Title",
      "serverBadges": [{ "hostname": "server", "role": "primary" }],
      "alert": { "type": "warning", "content": "Important note" },
      "steps": [
        { "title": "Step 1", "description": "What to do", "code": "command" }
      ],
      "code": { "content": "full command", "language": "bash", "runOn": "Server" }
    }
  ]
}

Include verification steps and rollback procedures where appropriate.`;
        maxTokens = 10000;
        break;
      }

      case 'organize_content': {
        const { content, topic, audience = 'intermediate' } = params;
        systemPrompt = `You are an expert curriculum designer and content organizer. Analyze provided content and organize it into a logical course structure. Return valid JSON only.`;
        userPrompt = `Analyze and organize this content into a structured course about "${topic}" for ${audience} level learners:

CONTENT TO ORGANIZE:
${content}

Return JSON:
{
  "title": "Course title based on content",
  "description": "Brief course description",
  "modules": [
    {
      "title": "Module title",
      "description": "What this module covers",
      "content_items": [
        {
          "title": "Content item title",
          "type": "presentation|tutorial|quiz|assignment|challenge",
          "description": "Brief description",
          "content": "Key content points from the input"
        }
      ]
    }
  ]
}

Guidelines:
- Create 3-8 modules based on content depth
- Each module should have 2-5 content items
- Include a mix of content types (presentations for concepts, quizzes for assessment, assignments for practice)
- Maintain logical progression from basics to advanced
- Extract key information from the provided content
- Group related topics together`;
        maxTokens = 8000;
        break;
      }

      case 'generate_learning_path': {
        const { modules, targetAudience = 'intermediate' } = params;
        systemPrompt = `You are an expert at designing learning paths. Create engaging, motivating milestone-based journeys. Return valid JSON only.`;
        userPrompt = `Create a learning path for these modules:

${JSON.stringify(modules, null, 2)}

Target audience: ${targetAudience}

Return JSON:
{
  "title": "Learning Path Title",
  "description": "Path description",
  "milestones": [
    {
      "title": "Milestone title",
      "description": "What learner will achieve",
      "module_ids": ["id1", "id2"],
      "unlock_condition": "sequential|quiz_pass|manual",
      "badge_icon": "🏆|⭐|🎯|🚀",
      "estimated_minutes": 120,
      "skills_gained": ["Skill 1", "Skill 2"]
    }
  ],
  "estimated_total_hours": 20,
  "difficulty_progression": "Description of how difficulty increases",
  "completion_badge": {
    "title": "Badge name",
    "description": "What this badge represents"
  }
}

Create 4-8 milestones that build logically. Make the journey feel rewarding.`;
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    // For non-chat actions, make the API call
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const textContent = response.content.find(b => b.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
    }

    // Some actions return raw text, not JSON
    const rawTextActions = ['improve_content', 'translate', 'explain_simple', 'summarize', 'explain_code', 'certificate_text'];
    
    if (rawTextActions.includes(action)) {
      return NextResponse.json({
        action,
        result: textContent.text
      });
    }

    // Parse JSON response for other actions
    try {
      let jsonText = textContent.text.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      const content = JSON.parse(jsonText);
      return NextResponse.json({
        action,
        result: content
      });
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      return NextResponse.json({ 
        error: 'Failed to parse response',
        raw: textContent.text,
        action
      }, { status: 500 });
    }
  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json({ error: 'AI service error' }, { status: 500 });
  }
}

