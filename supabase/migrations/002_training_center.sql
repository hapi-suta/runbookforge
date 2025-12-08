-- Training Center Schema - Enhanced Version
-- Enables instructors to create batches/classes with modules and various content types

-- Batches (e.g., "Batch 01 - PostgreSQL Fundamentals")
CREATE TABLE IF NOT EXISTS training_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Instructor's Clerk user ID
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  access_code TEXT UNIQUE, -- For student enrollment
  template TEXT DEFAULT 'full_course', -- 'full_course', 'workshop', 'assessment', 'custom'
  settings JSONB DEFAULT '{}', -- allow_download, show_progress, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sections within a batch (LEARN, PRACTICE, ASSESS, RESOURCES, CAREER)
CREATE TABLE IF NOT EXISTS training_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES training_batches(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL, -- learn, practice, assess, resources, career
  title TEXT NOT NULL, -- Display title
  description TEXT,
  icon TEXT, -- Lucide icon name
  color TEXT, -- Color class (amber, teal, purple, etc.)
  sort_order INT DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sections_batch ON training_sections(batch_id);

-- Modules within a section
CREATE TABLE IF NOT EXISTS training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES training_batches(id) ON DELETE CASCADE,
  section_id UUID REFERENCES training_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  -- Recording for this module's class session
  recording_url TEXT,
  recording_title TEXT,
  recording_duration INT, -- in minutes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content items within modules
CREATE TABLE IF NOT EXISTS training_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  -- Enhanced content types
  content_type TEXT NOT NULL CHECK (content_type IN (
    'presentation', 'runbook', 'tutorial', 'quiz', 'assignment', 
    'challenge', 'interview_prep', 'recording', 'external_link'
  )),
  -- For linked content
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  runbook_id UUID REFERENCES runbooks(id) ON DELETE SET NULL,
  -- For external/custom content
  external_url TEXT,
  -- For AI-generated content that's stored inline
  generated_content JSONB, -- Stores quiz questions, assignment details, etc.
  -- Metadata
  sort_order INT DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  estimated_duration INT, -- in minutes
  -- For quizzes
  time_limit INT, -- in minutes, NULL = no limit
  passing_score INT, -- percentage
  -- For assignments/challenges
  due_date TIMESTAMPTZ,
  max_points INT DEFAULT 100,
  rubric JSONB,
  solution JSONB, -- hidden from students
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz questions (for quiz content type)
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES training_content(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN (
    'mcq', 'multi_select', 'true_false', 'fill_blank', 'ordering', 'matching', 'short_answer'
  )),
  question TEXT NOT NULL,
  options JSONB, -- [{id, text, is_correct}] for MCQ/multi-select
  correct_answer TEXT, -- For fill_blank, short_answer
  explanation TEXT, -- Shown after answering
  points INT DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES training_enrollments(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES training_content(id) ON DELETE CASCADE,
  answers JSONB NOT NULL, -- {question_id: answer}
  score INT NOT NULL,
  max_score INT NOT NULL,
  percentage INT NOT NULL,
  passed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_taken INT -- in seconds
);

-- Assignment/Challenge submissions
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES training_enrollments(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES training_content(id) ON DELETE CASCADE,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('text', 'file', 'code', 'url')),
  content TEXT,
  file_url TEXT,
  -- AI evaluation
  ai_feedback TEXT,
  ai_score INT,
  ai_evaluated_at TIMESTAMPTZ,
  -- Instructor evaluation
  instructor_feedback TEXT,
  instructor_score INT,
  instructor_evaluated_at TIMESTAMPTZ,
  -- Status
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'ai_graded', 'graded', 'returned')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interview prep sessions
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES training_enrollments(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES training_content(id) ON DELETE CASCADE,
  questions_asked JSONB NOT NULL, -- [{question, category, difficulty}]
  responses JSONB NOT NULL, -- [{question_id, response, ai_evaluation, score}]
  overall_score INT,
  overall_feedback TEXT,
  session_duration INT, -- in seconds
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Student enrollments
CREATE TABLE IF NOT EXISTS training_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES training_batches(id) ON DELETE CASCADE,
  student_email TEXT NOT NULL,
  student_name TEXT,
  access_token TEXT UNIQUE NOT NULL, -- For view-only access
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'completed')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,
  UNIQUE(batch_id, student_email)
);

-- Progress tracking
CREATE TABLE IF NOT EXISTS training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES training_enrollments(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES training_content(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  time_spent INT DEFAULT 0, -- in seconds
  UNIQUE(enrollment_id, content_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_batches_user ON training_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_batches_access_code ON training_batches(access_code);
CREATE INDEX IF NOT EXISTS idx_modules_batch ON training_modules(batch_id);
CREATE INDEX IF NOT EXISTS idx_content_module ON training_content(module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_content ON quiz_questions(content_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_enrollment ON quiz_attempts(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_enrollment ON submissions(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_batch ON training_enrollments(batch_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_token ON training_enrollments(access_token);
CREATE INDEX IF NOT EXISTS idx_progress_enrollment ON training_progress(enrollment_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_training_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_batches_timestamp ON training_batches;
CREATE TRIGGER update_batches_timestamp BEFORE UPDATE ON training_batches
  FOR EACH ROW EXECUTE FUNCTION update_training_timestamp();

DROP TRIGGER IF EXISTS update_modules_timestamp ON training_modules;
CREATE TRIGGER update_modules_timestamp BEFORE UPDATE ON training_modules
  FOR EACH ROW EXECUTE FUNCTION update_training_timestamp();

DROP TRIGGER IF EXISTS update_content_timestamp ON training_content;
CREATE TRIGGER update_content_timestamp BEFORE UPDATE ON training_content
  FOR EACH ROW EXECUTE FUNCTION update_training_timestamp();

DROP TRIGGER IF EXISTS update_submissions_timestamp ON submissions;
CREATE TRIGGER update_submissions_timestamp BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_training_timestamp();
