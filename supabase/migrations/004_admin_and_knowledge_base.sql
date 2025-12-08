-- Admin Users Table
-- Allows primary admin to add other admins
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT, -- Clerk user ID (populated when they first login)
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  added_by TEXT NOT NULL, -- Clerk user ID of who added them
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- Knowledge Base Schema
-- Community-contributed runbooks (free, not for sale)

-- Categories for organizing knowledge base
CREATE TABLE IF NOT EXISTS kb_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Lucide icon name
  parent_id UUID REFERENCES kb_categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge base entries
CREATE TABLE IF NOT EXISTS kb_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Contributor's Clerk user ID
  category_id UUID REFERENCES kb_categories(id) ON DELETE SET NULL,
  
  -- Content reference (can be runbook or document)
  runbook_id UUID REFERENCES runbooks(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  
  -- Metadata
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[], -- For search/filtering
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
  reviewed_by TEXT, -- Admin who reviewed
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Stats
  view_count INT DEFAULT 0,
  helpful_count INT DEFAULT 0,
  
  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helpful votes (like upvotes)
CREATE TABLE IF NOT EXISTS kb_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES kb_entries(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entry_id, user_id)
);

-- Indexes for knowledge base
CREATE INDEX IF NOT EXISTS idx_kb_entries_category ON kb_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_kb_entries_status ON kb_entries(status);
CREATE INDEX IF NOT EXISTS idx_kb_entries_user ON kb_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_kb_entries_tags ON kb_entries USING GIN(tags);

-- Insert default categories
INSERT INTO kb_categories (name, slug, description, icon, sort_order) VALUES
  ('Databases', 'databases', 'Database administration and management', 'Database', 1),
  ('DevOps', 'devops', 'CI/CD, automation, and infrastructure', 'GitBranch', 2),
  ('Cloud', 'cloud', 'AWS, Azure, GCP, and cloud services', 'Cloud', 3),
  ('Containers', 'containers', 'Docker, Kubernetes, and containerization', 'Container', 4),
  ('Security', 'security', 'Security practices and compliance', 'Shield', 5),
  ('Monitoring', 'monitoring', 'Observability, logging, and alerting', 'Activity', 6),
  ('Networking', 'networking', 'Network configuration and troubleshooting', 'Network', 7),
  ('Linux', 'linux', 'Linux administration and shell scripting', 'Terminal', 8)
ON CONFLICT (slug) DO NOTHING;

-- Add subcategories
INSERT INTO kb_categories (name, slug, description, icon, parent_id, sort_order) 
SELECT 'PostgreSQL', 'postgresql', 'PostgreSQL database administration', 'Database', id, 1
FROM kb_categories WHERE slug = 'databases'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO kb_categories (name, slug, description, icon, parent_id, sort_order)
SELECT 'MySQL', 'mysql', 'MySQL database administration', 'Database', id, 2
FROM kb_categories WHERE slug = 'databases'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO kb_categories (name, slug, description, icon, parent_id, sort_order)
SELECT 'MongoDB', 'mongodb', 'MongoDB database administration', 'Database', id, 3
FROM kb_categories WHERE slug = 'databases'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO kb_categories (name, slug, description, icon, parent_id, sort_order)
SELECT 'Kubernetes', 'kubernetes', 'Kubernetes orchestration', 'Container', id, 1
FROM kb_categories WHERE slug = 'containers'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO kb_categories (name, slug, description, icon, parent_id, sort_order)
SELECT 'Docker', 'docker', 'Docker containerization', 'Container', id, 2
FROM kb_categories WHERE slug = 'containers'
ON CONFLICT (slug) DO NOTHING;

-- Update timestamp trigger for kb_entries
CREATE TRIGGER update_kb_entries_timestamp BEFORE UPDATE ON kb_entries
  FOR EACH ROW EXECUTE FUNCTION update_training_timestamp();
