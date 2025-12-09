-- Training Center Complete Schema
-- Run this in Supabase SQL Editor after dropping old tables

-- =============================================
-- CORE TABLES
-- =============================================

-- Training Batches (main container for a training program)
CREATE TABLE IF NOT EXISTS training_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  title text NOT NULL,
  description text,
  cover_image text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  access_code text UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Training Sections (categories within a batch: Learn, Practice, Assess, etc.)
CREATE TABLE IF NOT EXISTS training_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES training_batches(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  title text NOT NULL,
  description text,
  icon text,
  color text DEFAULT 'blue',
  sort_order integer DEFAULT 0,
  is_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Training Modules (units within sections)
CREATE TABLE IF NOT EXISTS training_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES training_batches(id) ON DELETE CASCADE,
  section_id uuid REFERENCES training_sections(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  sort_order integer DEFAULT 0,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Training Content (individual content items within modules)
CREATE TABLE IF NOT EXISTS training_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN (
    'presentation', 'runbook', 'tutorial', 'quiz', 'assignment', 
    'challenge', 'interview_prep', 'recording', 'external_link'
  )),
  document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  runbook_id uuid REFERENCES runbooks(id) ON DELETE SET NULL,
  external_url text,
  content_data jsonb DEFAULT '{}',
  sort_order integer DEFAULT 0,
  is_required boolean DEFAULT false,
  estimated_minutes integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- STUDENT ENROLLMENT & PROGRESS
-- =============================================

-- Student Enrollments
CREATE TABLE IF NOT EXISTS training_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES training_batches(id) ON DELETE CASCADE,
  student_email text NOT NULL,
  student_name text,
  access_token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'completed')),
  enrolled_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz,
  UNIQUE(batch_id, student_email)
);

-- Student Progress Tracking
CREATE TABLE IF NOT EXISTS training_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES training_enrollments(id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES training_content(id) ON DELETE CASCADE,
  status text DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at timestamptz,
  completed_at timestamptz,
  time_spent_seconds integer DEFAULT 0,
  UNIQUE(enrollment_id, content_id)
);

-- =============================================
-- QUIZ SYSTEM
-- =============================================

-- Quiz Questions (stored per content item of type 'quiz')
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES training_content(id) ON DELETE CASCADE,
  question_type text NOT NULL CHECK (question_type IN ('mcq', 'multi_select', 'true_false', 'fill_blank')),
  question text NOT NULL,
  options jsonb, -- Array of options for MCQ/multi-select
  correct_answer jsonb NOT NULL, -- Can be string, array, or boolean
  explanation text,
  points integer DEFAULT 1,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Quiz Attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES training_enrollments(id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES training_content(id) ON DELETE CASCADE,
  answers jsonb DEFAULT '{}',
  score integer,
  max_score integer,
  percentage numeric(5,2),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  time_spent_seconds integer
);

-- =============================================
-- ASSIGNMENTS & SUBMISSIONS
-- =============================================

-- Content Submissions (for assignments and challenges)
CREATE TABLE IF NOT EXISTS content_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES training_enrollments(id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES training_content(id) ON DELETE CASCADE,
  submission_type text DEFAULT 'text' CHECK (submission_type IN ('text', 'file', 'code', 'url')),
  content text,
  file_url text,
  code_language text,
  -- AI Evaluation
  ai_feedback text,
  ai_score integer,
  ai_evaluated_at timestamptz,
  -- Instructor Evaluation
  instructor_feedback text,
  instructor_score integer,
  instructor_id text,
  graded_at timestamptz,
  -- Status
  status text DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'ai_reviewed', 'graded', 'returned')),
  submitted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- AI MOCK INTERVIEWS
-- =============================================

CREATE TABLE IF NOT EXISTS interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES training_enrollments(id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES training_content(id) ON DELETE CASCADE,
  -- Session data
  questions_asked jsonb DEFAULT '[]',
  responses jsonb DEFAULT '[]',
  ai_evaluations jsonb DEFAULT '[]',
  -- Results
  overall_score integer,
  overall_feedback text,
  strengths jsonb DEFAULT '[]',
  improvements jsonb DEFAULT '[]',
  -- Timing
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  duration_seconds integer
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_training_batches_user ON training_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_training_sections_batch ON training_sections(batch_id);
CREATE INDEX IF NOT EXISTS idx_training_modules_batch ON training_modules(batch_id);
CREATE INDEX IF NOT EXISTS idx_training_modules_section ON training_modules(section_id);
CREATE INDEX IF NOT EXISTS idx_training_content_module ON training_content(module_id);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_batch ON training_enrollments(batch_id);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_token ON training_enrollments(access_token);
CREATE INDEX IF NOT EXISTS idx_training_progress_enrollment ON training_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_content ON quiz_questions(content_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_enrollment ON quiz_attempts(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_enrollment ON content_submissions(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_enrollment ON interview_sessions(enrollment_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE training_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for service role (used by our API)
CREATE POLICY "Service role full access" ON training_batches FOR ALL USING (true);
CREATE POLICY "Service role full access" ON training_sections FOR ALL USING (true);
CREATE POLICY "Service role full access" ON training_modules FOR ALL USING (true);
CREATE POLICY "Service role full access" ON training_content FOR ALL USING (true);
CREATE POLICY "Service role full access" ON training_enrollments FOR ALL USING (true);
CREATE POLICY "Service role full access" ON training_progress FOR ALL USING (true);
CREATE POLICY "Service role full access" ON quiz_questions FOR ALL USING (true);
CREATE POLICY "Service role full access" ON quiz_attempts FOR ALL USING (true);
CREATE POLICY "Service role full access" ON content_submissions FOR ALL USING (true);
CREATE POLICY "Service role full access" ON interview_sessions FOR ALL USING (true);
