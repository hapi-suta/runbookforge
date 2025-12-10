-- Add nested folder support to training_modules
-- This allows modules to be nested inside other modules

-- Add parent_id for nested hierarchy
ALTER TABLE training_modules 
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES training_modules(id) ON DELETE CASCADE;

-- Add is_folder flag to distinguish folders from content containers
ALTER TABLE training_modules 
ADD COLUMN IF NOT EXISTS is_folder boolean DEFAULT false;

-- Add icon and color for visual customization
ALTER TABLE training_modules 
ADD COLUMN IF NOT EXISTS icon text;

ALTER TABLE training_modules 
ADD COLUMN IF NOT EXISTS color text DEFAULT 'slate';

-- Index for efficient parent lookups
CREATE INDEX IF NOT EXISTS idx_training_modules_parent ON training_modules(parent_id);

-- Add trainer permissions table
CREATE TABLE IF NOT EXISTS trainer_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  role text DEFAULT 'student' CHECK (role IN ('student', 'trainer', 'admin')),
  ai_approved boolean DEFAULT false,
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trainer_permissions_user ON trainer_permissions(user_id);

ALTER TABLE trainer_permissions ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists, then create
DROP POLICY IF EXISTS "Service role full access" ON trainer_permissions;
CREATE POLICY "Service role full access" ON trainer_permissions FOR ALL USING (true);

-- Add description to training_content for better organization
ALTER TABLE training_content
ADD COLUMN IF NOT EXISTS description text;

