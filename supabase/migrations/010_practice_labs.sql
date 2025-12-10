-- ================================================================
-- PRACTICE LABS & FOLDER HIERARCHY MIGRATION
-- RunbookForge v2.0
-- ================================================================

-- ----------------------------------------------------------------
-- 1. TRAINING FOLDERS (Nested Hierarchy)
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS training_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES training_batches(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES training_sections(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES training_folders(id) ON DELETE CASCADE,
    
    -- Content
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT '📁',
    
    -- Metadata
    difficulty VARCHAR(20) DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_minutes INTEGER DEFAULT 30,
    
    -- Counts (denormalized for performance)
    folder_count INTEGER DEFAULT 0,
    content_count INTEGER DEFAULT 0,
    
    -- Ordering
    sort_order INTEGER DEFAULT 0,
    path_array UUID[] DEFAULT '{}',  -- Materialized path for fast queries
    depth INTEGER DEFAULT 0,
    
    -- Audit
    created_by VARCHAR(255) NOT NULL,
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_folders_parent ON training_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_batch ON training_folders(batch_id);
CREATE INDEX IF NOT EXISTS idx_folders_section ON training_folders(section_id);
CREATE INDEX IF NOT EXISTS idx_folders_path ON training_folders USING GIN(path_array);
CREATE INDEX IF NOT EXISTS idx_folders_depth ON training_folders(depth);

-- ----------------------------------------------------------------
-- 2. FOLDER CONTENTS (Links folders to content items)
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS folder_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES training_folders(id) ON DELETE CASCADE,
    
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN (
        'runbook', 'lab', 'video', 'quiz', 'presentation', 'document', 'external_link'
    )),
    content_id UUID NOT NULL,
    
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(folder_id, content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_folder_contents_folder ON folder_contents(folder_id);
CREATE INDEX IF NOT EXISTS idx_folder_contents_type ON folder_contents(content_type);

-- ----------------------------------------------------------------
-- 3. LAB TEMPLATES
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS lab_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    
    -- Container Config
    base_image VARCHAR(255) NOT NULL DEFAULT 'ubuntu:22.04',
    resources JSONB NOT NULL DEFAULT '{
        "cpu": "1",
        "memory": "2Gi",
        "storage": "10Gi"
    }',
    
    -- Pre-installed software
    preinstall TEXT[] DEFAULT '{}',
    
    -- Init scripts (array of script paths or inline scripts)
    init_scripts JSONB DEFAULT '[]',
    
    -- Environment variables
    environment JSONB DEFAULT '{}',
    
    -- Security
    sudo_access BOOLEAN DEFAULT true,
    blocked_commands TEXT[] DEFAULT ARRAY[
        'rm -rf /',
        'shutdown',
        'reboot',
        'halt',
        'poweroff'
    ],
    
    -- Timeout (seconds)
    timeout_seconds INTEGER DEFAULT 3600,
    idle_timeout_seconds INTEGER DEFAULT 1800,
    
    -- Metadata
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lab_templates_slug ON lab_templates(slug);
CREATE INDEX IF NOT EXISTS idx_lab_templates_category ON lab_templates(category);
CREATE INDEX IF NOT EXISTS idx_lab_templates_active ON lab_templates(is_active);

-- ----------------------------------------------------------------
-- 4. PRACTICE LABS (Runbook + Lab Template Link)
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS practice_labs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    runbook_id UUID REFERENCES runbooks(id) ON DELETE SET NULL,
    content_id UUID REFERENCES training_content(id) ON DELETE SET NULL,
    template_id UUID NOT NULL REFERENCES lab_templates(id),
    
    -- Lab-specific settings
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    auto_verify_steps BOOLEAN DEFAULT false,
    show_hints BOOLEAN DEFAULT true,
    allow_skip BOOLEAN DEFAULT false,
    
    -- Customizations
    custom_init_script TEXT,
    custom_env JSONB DEFAULT '{}',
    
    -- Instructions (if not linked to runbook)
    instructions JSONB DEFAULT '[]',
    -- Format: [{ step: 1, title: "...", content: "...", command: "...", verify: "..." }]
    
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_labs_runbook ON practice_labs(runbook_id);
CREATE INDEX IF NOT EXISTS idx_practice_labs_template ON practice_labs(template_id);

-- ----------------------------------------------------------------
-- 5. LAB SESSIONS
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS lab_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    user_id VARCHAR(255) NOT NULL,
    template_id UUID NOT NULL REFERENCES lab_templates(id),
    practice_lab_id UUID REFERENCES practice_labs(id),
    runbook_id UUID REFERENCES runbooks(id),
    enrollment_id UUID REFERENCES training_enrollments(id),
    
    -- Container Info
    container_id VARCHAR(255),
    container_ip VARCHAR(50),
    websocket_url VARCHAR(500),
    
    -- Status
    status VARCHAR(50) DEFAULT 'creating' CHECK (status IN (
        'creating', 'starting', 'running', 'paused', 'completed', 'timeout', 'error', 'terminated'
    )),
    status_message TEXT,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metrics
    commands_executed INTEGER DEFAULT 0,
    time_active_seconds INTEGER DEFAULT 0,
    
    -- Progress
    progress_data JSONB DEFAULT '{
        "completedSteps": [],
        "currentStep": 0,
        "checkpoints": [],
        "score": 0
    }',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON lab_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON lab_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON lab_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_template ON lab_sessions(template_id);

-- ----------------------------------------------------------------
-- 6. LAB COMMAND LOGS (Optional auditing)
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS lab_command_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES lab_sessions(id) ON DELETE CASCADE,
    
    command TEXT NOT NULL,
    exit_code INTEGER,
    output_preview TEXT,  -- First 500 chars only
    
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commands_session ON lab_command_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_commands_time ON lab_command_logs(executed_at);

-- ----------------------------------------------------------------
-- 7. TRAINER APPLICATIONS
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS trainer_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    
    -- Application Data
    full_name VARCHAR(255) NOT NULL,
    bio TEXT,
    expertise TEXT[] DEFAULT '{}',
    portfolio_url VARCHAR(500),
    reason TEXT,
    years_experience INTEGER,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_trainer_apps_status ON trainer_applications(status);
CREATE INDEX IF NOT EXISTS idx_trainer_apps_user ON trainer_applications(user_id);

-- ----------------------------------------------------------------
-- 8. AI GENERATION LOGS
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ai_generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    trainer_id VARCHAR(255) NOT NULL,
    
    -- What was generated
    content_type VARCHAR(50) NOT NULL,
    content_id UUID,
    
    -- AI Details
    model_used VARCHAR(100) NOT NULL,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    cost_cents INTEGER,
    
    -- Request summary
    input_topic VARCHAR(500),
    input_summary TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_trainer ON ai_generation_logs(trainer_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_type ON ai_generation_logs(content_type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_date ON ai_generation_logs(created_at);

-- ----------------------------------------------------------------
-- 9. ENHANCE TRAINER PERMISSIONS
-- ----------------------------------------------------------------

ALTER TABLE trainer_permissions 
ADD COLUMN IF NOT EXISTS can_create_labs BOOLEAN DEFAULT false;

ALTER TABLE trainer_permissions 
ADD COLUMN IF NOT EXISTS can_use_ai BOOLEAN DEFAULT false;

ALTER TABLE trainer_permissions 
ADD COLUMN IF NOT EXISTS max_concurrent_labs INTEGER DEFAULT 5;

ALTER TABLE trainer_permissions 
ADD COLUMN IF NOT EXISTS lab_timeout_seconds INTEGER DEFAULT 3600;

-- ----------------------------------------------------------------
-- 10. FUNCTIONS
-- ----------------------------------------------------------------

-- Function to update folder path when parent changes
CREATE OR REPLACE FUNCTION update_folder_path()
RETURNS TRIGGER AS $$
DECLARE
    parent_path UUID[];
    parent_depth INTEGER;
BEGIN
    IF NEW.parent_id IS NULL THEN
        NEW.path_array := ARRAY[NEW.id];
        NEW.depth := 0;
    ELSE
        SELECT path_array, depth INTO parent_path, parent_depth
        FROM training_folders WHERE id = NEW.parent_id;
        
        NEW.path_array := array_append(parent_path, NEW.id);
        NEW.depth := parent_depth + 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_folder_path ON training_folders;
CREATE TRIGGER trigger_update_folder_path
    BEFORE INSERT OR UPDATE OF parent_id ON training_folders
    FOR EACH ROW
    EXECUTE FUNCTION update_folder_path();

-- Function to update folder counts
CREATE OR REPLACE FUNCTION update_folder_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment parent folder count
        IF NEW.parent_id IS NOT NULL THEN
            UPDATE training_folders 
            SET folder_count = folder_count + 1
            WHERE id = NEW.parent_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement parent folder count
        IF OLD.parent_id IS NOT NULL THEN
            UPDATE training_folders 
            SET folder_count = folder_count - 1
            WHERE id = OLD.parent_id;
        END IF;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_folder_counts ON training_folders;
CREATE TRIGGER trigger_update_folder_counts
    AFTER INSERT OR DELETE ON training_folders
    FOR EACH ROW
    EXECUTE FUNCTION update_folder_counts();

-- Function to update content counts
CREATE OR REPLACE FUNCTION update_content_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE training_folders 
        SET content_count = content_count + 1
        WHERE id = NEW.folder_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE training_folders 
        SET content_count = content_count - 1
        WHERE id = OLD.folder_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_content_counts ON folder_contents;
CREATE TRIGGER trigger_update_content_counts
    AFTER INSERT OR DELETE ON folder_contents
    FOR EACH ROW
    EXECUTE FUNCTION update_content_counts();

-- ----------------------------------------------------------------
-- 11. RLS POLICIES
-- ----------------------------------------------------------------

ALTER TABLE training_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE folder_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_command_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- Service role policies
DO $$
BEGIN
    -- Training folders
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'training_folders' AND policyname = 'Service role full access on training_folders') THEN
        CREATE POLICY "Service role full access on training_folders" ON training_folders FOR ALL TO service_role USING (true);
    END IF;
    
    -- Folder contents
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'folder_contents' AND policyname = 'Service role full access on folder_contents') THEN
        CREATE POLICY "Service role full access on folder_contents" ON folder_contents FOR ALL TO service_role USING (true);
    END IF;
    
    -- Lab templates
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lab_templates' AND policyname = 'Service role full access on lab_templates') THEN
        CREATE POLICY "Service role full access on lab_templates" ON lab_templates FOR ALL TO service_role USING (true);
    END IF;
    
    -- Practice labs
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'practice_labs' AND policyname = 'Service role full access on practice_labs') THEN
        CREATE POLICY "Service role full access on practice_labs" ON practice_labs FOR ALL TO service_role USING (true);
    END IF;
    
    -- Lab sessions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lab_sessions' AND policyname = 'Service role full access on lab_sessions') THEN
        CREATE POLICY "Service role full access on lab_sessions" ON lab_sessions FOR ALL TO service_role USING (true);
    END IF;
    
    -- Lab command logs
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lab_command_logs' AND policyname = 'Service role full access on lab_command_logs') THEN
        CREATE POLICY "Service role full access on lab_command_logs" ON lab_command_logs FOR ALL TO service_role USING (true);
    END IF;
    
    -- Trainer applications
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trainer_applications' AND policyname = 'Service role full access on trainer_applications') THEN
        CREATE POLICY "Service role full access on trainer_applications" ON trainer_applications FOR ALL TO service_role USING (true);
    END IF;
    
    -- AI generation logs
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_generation_logs' AND policyname = 'Service role full access on ai_generation_logs') THEN
        CREATE POLICY "Service role full access on ai_generation_logs" ON ai_generation_logs FOR ALL TO service_role USING (true);
    END IF;
END
$$;

-- ----------------------------------------------------------------
-- 12. SEED DEFAULT LAB TEMPLATES
-- ----------------------------------------------------------------

INSERT INTO lab_templates (name, slug, description, base_image, resources, preinstall, category, tags)
VALUES 
    (
        'PostgreSQL 15 Lab',
        'postgresql-15',
        'Ubuntu 22.04 with PostgreSQL 15 pre-installed. Ready for database administration practice.',
        'ubuntu:22.04',
        '{"cpu": "2", "memory": "4Gi", "storage": "20Gi"}',
        ARRAY['postgresql-15', 'postgresql-contrib-15', 'vim', 'nano', 'htop', 'curl', 'wget'],
        'database',
        ARRAY['postgresql', 'database', 'sql']
    ),
    (
        'Linux Fundamentals Lab',
        'linux-basics',
        'Clean Ubuntu 22.04 environment for learning Linux basics.',
        'ubuntu:22.04',
        '{"cpu": "1", "memory": "2Gi", "storage": "10Gi"}',
        ARRAY['vim', 'nano', 'htop', 'curl', 'wget', 'tree', 'net-tools'],
        'linux',
        ARRAY['linux', 'bash', 'shell']
    ),
    (
        'Docker Lab',
        'docker-lab',
        'Ubuntu with Docker pre-installed for container practice.',
        'ubuntu:22.04',
        '{"cpu": "2", "memory": "4Gi", "storage": "30Gi"}',
        ARRAY['docker.io', 'docker-compose', 'vim', 'curl'],
        'devops',
        ARRAY['docker', 'containers', 'devops']
    ),
    (
        'Patroni HA Lab',
        'patroni-ha',
        'Multi-node PostgreSQL high availability setup with Patroni, etcd, and HAProxy.',
        'ubuntu:22.04',
        '{"cpu": "4", "memory": "8Gi", "storage": "50Gi"}',
        ARRAY['postgresql-15', 'etcd', 'haproxy', 'patroni', 'vim'],
        'database',
        ARRAY['postgresql', 'patroni', 'high-availability', 'clustering']
    )
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------
-- Done!
-- ----------------------------------------------------------------

