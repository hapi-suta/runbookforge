-- Training Center Complete Schema
-- Run this to ensure all training tables exist with correct dependencies

-- 1. Batches (the root entity)
CREATE TABLE IF NOT EXISTS training_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  access_code TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_batches_user ON training_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_batches_access_code ON training_batches(access_code);

-- 2. Sections within a batch
CREATE TABLE IF NOT EXISTS training_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES training_batches(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INT DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sections_batch ON training_sections(batch_id);

-- 3. Student enrollments (needed before quiz_attempts)
CREATE TABLE IF NOT EXISTS training_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES training_batches(id) ON DELETE CASCADE,
  student_email TEXT NOT NULL,
  student_name TEXT,
  access_token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'completed')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,
  UNIQUE(batch_id, student_email)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_batch ON training_enrollments(batch_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_token ON training_enrollments(access_token);

-- 4. Modules within sections
CREATE TABLE IF NOT EXISTS training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES training_batches(id) ON DELETE CASCADE,
  section_id UUID REFERENCES training_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  recording_url TEXT,
  recording_platform TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modules_batch ON training_modules(batch_id);
CREATE INDEX IF NOT EXISTS idx_modules_section ON training_modules(section_id);

-- 5. Content within modules
CREATE TABLE IF NOT EXISTS training_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN (
    'presentation', 'runbook', 'tutorial', 'quiz', 'assignment', 
    'challenge', 'interview_prep', 'recording', 'external_link', 'document'
  )),
  document_id UUID,
  runbook_id UUID,
  external_url TEXT,
  generated_content JSONB,
  content_data JSONB DEFAULT '{}',
  sort_order INT DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  estimated_duration INT,
  time_limit INT,
  passing_score INT,
  due_date TIMESTAMPTZ,
  max_points INT DEFAULT 100,
  rubric JSONB,
  solution JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_module ON training_content(module_id);

-- 6. Quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES training_content(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN (
    'mcq', 'multi_select', 'true_false', 'fill_blank', 'ordering', 'matching', 'short_answer'
  )),
  question TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT,
  explanation TEXT,
  points INT DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_content ON quiz_questions(content_id);

-- 7. Quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES training_enrollments(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES training_content(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  score INT,
  max_score INT,
  percentage DECIMAL(5,2),
  passed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INT
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_enrollment ON quiz_attempts(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_content ON quiz_attempts(content_id);

-- 8. Submissions for assignments/challenges
CREATE TABLE IF NOT EXISTS content_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES training_enrollments(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES training_content(id) ON DELETE CASCADE,
  submission_type TEXT DEFAULT 'text' CHECK (submission_type IN ('text', 'file', 'code', 'url')),
  content TEXT,
  file_url TEXT,
  code_language TEXT,
  ai_feedback TEXT,
  ai_score INT,
  ai_evaluated_at TIMESTAMPTZ,
  instructor_feedback TEXT,
  instructor_score INT,
  instructor_id TEXT,
  graded_at TIMESTAMPTZ,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'ai_reviewed', 'graded', 'returned', 'resubmit')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_enrollment ON content_submissions(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_content ON content_submissions(content_id);

-- 9. Interview prep sessions
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES training_enrollments(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES training_content(id) ON DELETE CASCADE,
  questions_asked JSONB DEFAULT '[]',
  responses JSONB DEFAULT '[]',
  ai_evaluations JSONB DEFAULT '[]',
  overall_score INT,
  overall_feedback TEXT,
  strengths JSONB DEFAULT '[]',
  improvements JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INT
);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_enrollment ON interview_sessions(enrollment_id);

-- 10. Progress tracking
CREATE TABLE IF NOT EXISTS training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES training_enrollments(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES training_content(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  time_spent INT DEFAULT 0,
  UNIQUE(enrollment_id, content_id)
);

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
