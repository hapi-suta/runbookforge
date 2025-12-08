-- Training Center Schema
-- Enables instructors to create batches/classes with modules and student access

-- Batches (e.g., "Batch 01 - PostgreSQL Fundamentals")
CREATE TABLE IF NOT EXISTS training_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Instructor's Clerk user ID
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  access_code TEXT UNIQUE, -- For student enrollment
  settings JSONB DEFAULT '{}', -- allow_download, show_progress, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules within a batch
CREATE TABLE IF NOT EXISTS training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES training_batches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content items within modules (links to existing documents/runbooks or external)
CREATE TABLE IF NOT EXISTS training_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('document', 'runbook', 'external_link', 'text', 'video')),
  -- For linked content
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  runbook_id UUID REFERENCES runbooks(id) ON DELETE SET NULL,
  -- For external/custom content
  external_url TEXT,
  text_content TEXT,
  -- Metadata
  sort_order INT DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  estimated_duration INT, -- in minutes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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

-- Progress tracking (optional)
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

CREATE TRIGGER update_batches_timestamp BEFORE UPDATE ON training_batches
  FOR EACH ROW EXECUTE FUNCTION update_training_timestamp();

CREATE TRIGGER update_modules_timestamp BEFORE UPDATE ON training_modules
  FOR EACH ROW EXECUTE FUNCTION update_training_timestamp();

CREATE TRIGGER update_content_timestamp BEFORE UPDATE ON training_content
  FOR EACH ROW EXECUTE FUNCTION update_training_timestamp();
