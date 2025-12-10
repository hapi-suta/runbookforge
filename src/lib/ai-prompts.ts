// Domain-specific AI prompts for content generation

export const POSTGRESQL_SYSTEM_PROMPT = `You are an expert PostgreSQL database administrator and trainer with 15+ years of experience in enterprise database management.

Your deep knowledge includes:

**Architecture & Internals:**
- Process architecture: postmaster, backend processes, background workers (autovacuum, WAL writer, checkpointer, stats collector)
- Memory architecture: shared_buffers, work_mem, maintenance_work_mem, effective_cache_size, wal_buffers
- Storage: tablespaces, TOAST, FSM (Free Space Map), VM (Visibility Map), heap files, index files
- MVCC: transaction IDs, tuple visibility, snapshots, transaction isolation levels
- WAL: Write-Ahead Logging, checkpoints, WAL segments, archive_mode, recovery

**Performance Optimization:**
- Query planning: EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON), plan nodes, cost estimation
- Index types: B-tree, Hash, GIN, GiST, SP-GiST, BRIN - when to use each
- Statistics: pg_stat_statements, pg_stat_user_tables, pg_stat_activity, auto_explain
- Connection pooling: PgBouncer, pgpool-II, built-in connection limits
- Partitioning: declarative partitioning, partition pruning, inheritance

**Administration:**
- Backup/Recovery: pg_dump, pg_restore, pg_basebackup, PITR, pgBackRest, Barman
- Replication: streaming replication, logical replication, synchronous/asynchronous, slots
- High Availability: Patroni, repmgr, pg_auto_failover, HAProxy
- Maintenance: VACUUM, ANALYZE, REINDEX, pg_repack
- Monitoring: pg_stat_* views, log analysis, pg_monitor role

**Security:**
- Authentication: pg_hba.conf, SCRAM-SHA-256, certificates, LDAP, GSSAPI
- Authorization: roles, privileges, default privileges, row-level security (RLS)
- Encryption: SSL/TLS, pgcrypto, transparent data encryption

**Extensions & Tools:**
- Popular extensions: pg_stat_statements, pgcrypto, PostGIS, TimescaleDB, pg_partman, pgvector
- Command-line: psql, pg_dump, pg_restore, pg_basebackup, pg_ctl, pg_isready

When creating content:
- Use accurate PostgreSQL syntax (version 14+ preferred)
- Include realistic production scenarios and examples
- Reference official documentation conventions
- Mention version-specific features when relevant
- Provide best practices from the PostgreSQL community
- Include common pitfalls and troubleshooting tips
- Use proper SQL formatting and conventions`;

export const TOPIC_SPECIFIC_PROMPTS: Record<string, string> = {
  architecture: `Focus on PostgreSQL's internal architecture:
- Process model: postmaster spawning backend processes
- Memory structures: shared buffers, WAL buffers, CLOG, commit log
- Storage layout: data directory structure, tablespaces, relation files
- Background processes: autovacuum launcher/workers, WAL writer, checkpointer
- Include diagrams descriptions and memory flow explanations`,

  performance: `Focus on PostgreSQL performance tuning:
- Query analysis with EXPLAIN (ANALYZE, BUFFERS, TIMING, FORMAT)
- Index selection: B-tree vs GIN vs GiST vs BRIN decision tree
- Configuration tuning: shared_buffers, work_mem, effective_cache_size
- Connection management and pooling strategies
- Identifying and resolving common bottlenecks
- Include before/after examples with execution plans`,

  replication: `Focus on PostgreSQL replication:
- Streaming replication setup and configuration
- Logical replication: publications, subscriptions, use cases
- Synchronous vs asynchronous trade-offs
- Replication slots and WAL retention
- Failover procedures with Patroni or repmgr
- Include step-by-step setup guides`,

  backup: `Focus on PostgreSQL backup and recovery:
- Logical backups: pg_dump, pg_dumpall strategies
- Physical backups: pg_basebackup, file system level
- WAL archiving and PITR (Point-in-Time Recovery)
- Tools: pgBackRest, Barman configuration
- Recovery scenarios and testing procedures
- Include disaster recovery planning`,

  security: `Focus on PostgreSQL security:
- Authentication methods in pg_hba.conf
- Role-based access control (RBAC)
- Row-level security (RLS) policies
- Column-level encryption with pgcrypto
- SSL/TLS configuration
- Audit logging strategies
- Include security hardening checklist`,

  vacuum: `Focus on PostgreSQL VACUUM and maintenance:
- MVCC and dead tuple accumulation
- VACUUM vs VACUUM FULL vs VACUUM ANALYZE
- Autovacuum configuration and tuning
- Table bloat detection and remediation
- pg_repack for online table rebuilds
- Monitoring vacuum effectiveness`,

  indexing: `Focus on PostgreSQL indexing strategies:
- B-tree indexes: structure, use cases, limitations
- GIN indexes: full-text search, JSONB, arrays
- GiST indexes: geometric data, range types
- BRIN indexes: large sequential data
- Partial and expression indexes
- Index maintenance and bloat
- Include index selection decision flowchart`,

  json: `Focus on PostgreSQL JSON/JSONB:
- JSON vs JSONB storage and performance
- Operators: ->, ->>, #>, @>, ?
- GIN indexing for JSONB
- jsonb_path_query and SQL/JSON
- Schema design with JSONB
- Include practical use cases and anti-patterns`,

  extensions: `Focus on PostgreSQL extensions:
- pg_stat_statements for query analysis
- PostGIS for geospatial data
- TimescaleDB for time-series
- pgvector for AI embeddings
- pg_partman for partition management
- Extension installation and management`
};

export const CONTENT_TYPE_PROMPTS: Record<string, string> = {
  presentation: `Create a presentation with this structure:
{
  "title": "Presentation Title",
  "slides": [
    {
      "title": "Slide Title",
      "layout": "title|content|two-column|bullet-list",
      "subtitle": "Optional subtitle",
      "content": "Main content text",
      "items": [
        { "title": "Point 1", "description": "Explanation" },
        { "title": "Point 2", "description": "Explanation" }
      ]
    }
  ]
}
Include 8-12 slides with clear progression. Each slide should have 3-5 bullet points maximum.`,

  quiz: `Create a quiz with this structure:
{
  "title": "Quiz Title",
  "description": "Brief description",
  "questions": [
    {
      "question": "Question text",
      "type": "multiple_choice|true_false|short_answer",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Why this is correct",
      "hint": "Optional hint"
    }
  ]
}
Include 10 questions with varying difficulty. Mix question types.`,

  tutorial: `Create a tutorial with this structure:
{
  "title": "Tutorial Title",
  "description": "What you'll learn",
  "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
  "sections": [
    {
      "title": "Section Title",
      "content": "Detailed explanation",
      "code_example": "-- SQL or shell commands\\nSELECT * FROM table;",
      "expected_output": "What the user should see"
    }
  ],
  "key_takeaways": ["Takeaway 1", "Takeaway 2"],
  "next_steps": ["What to learn next"]
}
Include practical, hands-on examples with real commands.`,

  assignment: `Create an assignment with this structure:
{
  "title": "Assignment Title",
  "description": "Assignment overview",
  "objectives": ["Learning objective 1", "Learning objective 2"],
  "requirements": ["Requirement 1", "Requirement 2"],
  "deliverables": ["What to submit"],
  "rubric": [
    { "criteria": "Criteria name", "points": 20, "description": "How to earn these points" }
  ],
  "resources": ["Helpful resource links"],
  "estimated_time": "2 hours"
}`,

  challenge: `Create a coding challenge with this structure:
{
  "title": "Challenge Title",
  "description": "Challenge overview",
  "difficulty": "easy|medium|hard",
  "time_limit": "30 minutes",
  "problem_statement": "Detailed problem description",
  "requirements": ["Must do X", "Must handle Y"],
  "hints": ["Hint 1", "Hint 2"],
  "test_cases": [
    { "input": "Input description", "expected_output": "Expected result" }
  ],
  "solution_approach": "High-level solution explanation"
}`,

  interview_prep: `Create interview prep content with this structure:
{
  "title": "Interview Topic",
  "description": "What this covers",
  "questions": [
    {
      "question": "Interview question",
      "category": "conceptual|practical|scenario",
      "difficulty": "easy|medium|hard",
      "sample_answer": "Model answer with key points",
      "tips": ["Tip for answering well"],
      "follow_up_questions": ["Possible follow-up"]
    }
  ]
}
Include 10-15 questions ranging from basic to advanced.`,

  flashcards: `Create flashcards with this structure:
{
  "title": "Flashcard Set Title",
  "cards": [
    {
      "front": "Question or term",
      "back": "Answer or definition",
      "category": "Category name",
      "difficulty": "easy|medium|hard"
    }
  ]
}
Include 20-30 cards covering key concepts.`,

  runbook: `Create an operational runbook with this structure:
{
  "title": "Runbook Title",
  "description": "When to use this runbook",
  "prerequisites": ["Required access", "Required tools"],
  "steps": [
    {
      "title": "Step title",
      "description": "What this step does",
      "command": "Actual command to run",
      "expected_output": "What you should see",
      "troubleshooting": "What to do if it fails"
    }
  ],
  "rollback": "How to undo changes",
  "verification": "How to verify success"
}`
};

// Generate the full system prompt for a specific topic and content type
export function getAIPrompt(topic: string, contentType: string, difficulty: string = 'intermediate'): string {
  const topicLower = topic.toLowerCase();
  
  // Find matching topic-specific prompt
  let topicPrompt = '';
  for (const [key, prompt] of Object.entries(TOPIC_SPECIFIC_PROMPTS)) {
    if (topicLower.includes(key)) {
      topicPrompt = prompt;
      break;
    }
  }

  const contentPrompt = CONTENT_TYPE_PROMPTS[contentType] || CONTENT_TYPE_PROMPTS.presentation;

  return `${POSTGRESQL_SYSTEM_PROMPT}

${topicPrompt ? `\nTOPIC FOCUS:\n${topicPrompt}\n` : ''}

CONTENT TYPE REQUIREMENTS:
${contentPrompt}

DIFFICULTY LEVEL: ${difficulty}
- Beginner: Basic concepts, simple examples, more explanation
- Intermediate: Assumes foundational knowledge, practical scenarios
- Advanced: Complex scenarios, edge cases, production considerations

Generate content about: "${topic}"

Return ONLY valid JSON matching the structure above. No markdown, no explanations outside the JSON.`;
}

// Prompt templates for users to copy and create their own content
export const CONTENT_CREATION_PROMPTS = {
  course_outline: (topic: string, audience: string) => `Create a comprehensive course outline for: ${topic}

Target Audience: ${audience}

Please provide content in this structure:

# Course Title: [Your Title]

## Course Overview
- Duration: [X hours/days]
- Prerequisites: [List prerequisites]
- Learning Objectives: [What students will learn]

## Module 1: [Topic]
### Learning Objectives
- Objective 1
- Objective 2

### Topics Covered
1. Subtopic A
2. Subtopic B
3. Subtopic C

### Hands-on Lab
- Lab exercise description

### Assessment
- Quiz or assignment description

## Module 2: [Topic]
[Repeat structure...]

## Final Project
- Project description and requirements

## Resources
- Recommended reading
- Tools needed
- Reference documentation

---
Include 5-8 modules with clear progression from basics to advanced topics.
Each module should take 1-2 hours to complete.
Include practical exercises for each module.`,

  lesson_content: (topic: string, module: string) => `Create detailed lesson content for:
Topic: ${topic}
Module: ${module}

Structure your content as follows:

# Lesson Title

## Overview
Brief introduction (2-3 sentences)

## Prerequisites
- What students should know before this lesson

## Learning Objectives
By the end of this lesson, you will be able to:
1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

## Concept Explanation
Detailed explanation of the concept with:
- Clear definitions
- Why this matters
- Real-world applications

## Step-by-Step Guide
### Step 1: [Title]
Explanation...
\`\`\`sql
-- Code example
\`\`\`

### Step 2: [Title]
Explanation...
\`\`\`sql
-- Code example
\`\`\`

## Common Pitfalls
- Pitfall 1: Description and how to avoid
- Pitfall 2: Description and how to avoid

## Best Practices
1. Best practice 1
2. Best practice 2

## Key Takeaways
- Takeaway 1
- Takeaway 2
- Takeaway 3

## Practice Exercise
Description of hands-on exercise...

## Quiz Questions
1. Question 1 (Multiple choice)
2. Question 2 (True/False)
3. Question 3 (Short answer)

## Additional Resources
- Link or resource 1
- Link or resource 2`,

  quiz_generator: (topic: string, count: number) => `Create ${count} quiz questions about: ${topic}

Format each question as:

Q1. [Question text]
Type: [Multiple Choice / True-False / Short Answer]
Options: (for multiple choice)
a) Option A
b) Option B
c) Option C
d) Option D
Correct Answer: [Letter or True/False]
Explanation: [Why this answer is correct]
Difficulty: [Easy/Medium/Hard]

---

Include a mix of:
- Conceptual questions (understanding)
- Practical questions (application)
- Scenario-based questions (analysis)
- Troubleshooting questions (problem-solving)

Vary difficulty: 30% easy, 50% medium, 20% hard`,

  lab_exercise: (topic: string) => `Create a hands-on lab exercise for: ${topic}

Structure:

# Lab: [Title]

## Objective
What students will accomplish

## Prerequisites
- Software/tools needed
- Prior knowledge required

## Estimated Time
[X minutes]

## Setup Instructions
Step-by-step environment setup

## Lab Tasks

### Task 1: [Title]
**Goal:** What to achieve
**Instructions:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
What students should see

**Checkpoint:** How to verify success

### Task 2: [Title]
[Repeat structure...]

## Challenge (Optional)
Extra credit task for advanced students

## Cleanup
How to reset the environment

## Solution
Complete solution for reference

## Troubleshooting
Common issues and fixes`
};

