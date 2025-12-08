-- Training Center Phase 1 - Enhanced Schema
-- Adds quiz engine, assignments, challenges, and interview prep

-- Drop and recreate content type to add new types
ALTER TABLE training_content 
  DROP CONSTRAINT IF EXISTS training_content_content_type_check;

ALTER TABLE training_content 
  ADD CONSTRAINT training_content_content_type_check 
  CHECK (content_type IN (
    'presentation',
    'runbook', 
    'tutorial',
    'quiz',
    'assignment',
    'challenge',
    'interview_prep',
    'recording',
    'external_link',
    'document'
  ));

-- Add new columns to training_content for richer content
ALTER TABLE training_content ADD COLUMN IF NOT EXISTS content_data JSONB DEFAULT '{}';
-- content_data stores type-specific data:
-- For quiz: { questions: [...], time_limit: 30, passing_score: 70 }
-- For assignment: { description: "", rubric: [...], due_date: "", max_score: 100 }
-- For challenge: { scenario: "", hints: [...], solution: "", difficulty: "medium" }
-- For interview_prep: { questions: [...], difficulty: "medium", topic: "" }
-- For recording: { url: "", platform: "zoom|youtube|drive", duration: "" }

-- Add module recording URL (each module can have a class recording)
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS recording_url TEXT;
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS recording_platform TEXT;

-- Quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES training_content(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'multi_select', 'true_false', 'fill_blank', 'ordering', 'matching')),
  question TEXT NOT NULL,
  options JSONB, -- [{id, text, is_correct}] or for matching [{left, right}]
  correct_answer TEXT, -- For fill_blank
  explanation TEXT,
  points INT DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES training_enrollments(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES training_content(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}', -- {question_id: answer}
  score INT,
  max_score INT,
  percentage DECIMAL(5,2),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INT,
  UNIQUE(enrollment_id, content_id, started_at)
);

-- Assignment/Challenge submissions
CREATE TABLE IF NOT EXISTS content_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES training_enrollments(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES training_content(id) ON DELETE CASCADE,
  submission_type TEXT DEFAULT 'text' CHECK (submission_type IN ('text', 'file', 'code', 'url')),
  content TEXT,
  file_url TEXT,
  code_language TEXT,
  -- AI evaluation
  ai_feedback TEXT,
  ai_score INT,
  ai_evaluated_at TIMESTAMPTZ,
  -- Instructor evaluation  
  instructor_feedback TEXT,
  instructor_score INT,
  instructor_id TEXT,
  graded_at TIMESTAMPTZ,
  -- Status
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'ai_reviewed', 'graded', 'returned', 'resubmit')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interview prep sessions (for AI evaluator)
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES training_enrollments(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES training_content(id) ON DELETE CASCADE,
  -- Session data
  questions_asked JSONB DEFAULT '[]', -- [{question, asked_at}]
  responses JSONB DEFAULT '[]', -- [{question_id, response, response_at}]
  ai_evaluations JSONB DEFAULT '[]', -- [{question_id, score, feedback}]
  -- Summary
  overall_score INT,
  overall_feedback TEXT,
  strengths JSONB DEFAULT '[]',
  improvements JSONB DEFAULT '[]',
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INT
);

-- Batch templates
CREATE TABLE IF NOT EXISTS batch_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'BookOpen',
  structure JSONB NOT NULL, -- { modules: [{ title, content_types: ['presentation', 'quiz'] }] }
  is_system BOOLEAN DEFAULT false, -- System templates vs user-created
  user_id TEXT, -- NULL for system templates
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default system templates
INSERT INTO batch_templates (name, description, icon, structure, is_system) VALUES
(
  'Technical Course',
  'Complete technical course with presentations, runbooks, quizzes, and assignments',
  'GraduationCap',
  '{
    "modules": [
      {"title": "Module 1: Introduction", "suggested_content": ["presentation", "quiz"]},
      {"title": "Module 2: Core Concepts", "suggested_content": ["presentation", "runbook", "assignment"]},
      {"title": "Module 3: Hands-On Practice", "suggested_content": ["presentation", "challenge", "quiz"]},
      {"title": "Module 4: Advanced Topics", "suggested_content": ["presentation", "runbook", "assignment"]},
      {"title": "Final Assessment", "suggested_content": ["quiz", "assignment"]}
    ],
    "default_content_types": ["presentation", "runbook", "quiz", "assignment"]
  }',
  true
),
(
  'Workshop / Bootcamp',
  'Intensive hands-on workshop with challenges and labs',
  'Hammer',
  '{
    "modules": [
      {"title": "Session 1: Setup & Basics", "suggested_content": ["presentation", "runbook"]},
      {"title": "Session 2: Hands-On Lab", "suggested_content": ["challenge", "runbook"]},
      {"title": "Session 3: Advanced Lab", "suggested_content": ["challenge"]},
      {"title": "Session 4: Capstone", "suggested_content": ["challenge", "assignment"]}
    ],
    "default_content_types": ["presentation", "runbook", "challenge"]
  }',
  true
),
(
  'Interview Preparation',
  'Interview questions, mock interviews, and AI evaluation',
  'UserCheck',
  '{
    "modules": [
      {"title": "Fundamentals Review", "suggested_content": ["presentation", "quiz"]},
      {"title": "Common Questions", "suggested_content": ["interview_prep"]},
      {"title": "Technical Deep Dive", "suggested_content": ["interview_prep", "challenge"]},
      {"title": "Mock Interviews", "suggested_content": ["interview_prep"]},
      {"title": "Final Prep", "suggested_content": ["interview_prep", "quiz"]}
    ],
    "default_content_types": ["interview_prep", "quiz", "presentation"]
  }',
  true
),
(
  'Certification Prep',
  'Study guides, practice exams, and flashcards for certification',
  'Award',
  '{
    "modules": [
      {"title": "Domain 1", "suggested_content": ["presentation", "quiz"]},
      {"title": "Domain 2", "suggested_content": ["presentation", "quiz"]},
      {"title": "Domain 3", "suggested_content": ["presentation", "quiz"]},
      {"title": "Practice Exams", "suggested_content": ["quiz"]},
      {"title": "Final Review", "suggested_content": ["presentation", "quiz"]}
    ],
    "default_content_types": ["presentation", "quiz"]
  }',
  true
),
(
  'Empty / Custom',
  'Start from scratch and build your own structure',
  'Folder',
  '{"modules": [], "default_content_types": ["presentation", "runbook", "quiz", "assignment", "challenge"]}',
  true
)
ON CONFLICT DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quiz_questions_content ON quiz_questions(content_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_enrollment ON quiz_attempts(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_enrollment ON content_submissions(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_content ON content_submissions(content_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_enrollment ON interview_sessions(enrollment_id);
