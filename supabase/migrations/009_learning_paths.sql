-- Learning Paths / Roadmap Feature
-- Enables visual journey tracking for students

-- Learning Paths table
CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES training_batches(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milestones table (checkpoints in the learning path)
CREATE TABLE IF NOT EXISTS learning_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    badge_icon VARCHAR(50) DEFAULT '⭐',
    unlock_condition VARCHAR(50) DEFAULT 'sequential', -- sequential, quiz_pass, manual
    estimated_minutes INTEGER DEFAULT 60,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milestone-Module relationship (which modules belong to which milestone)
CREATE TABLE IF NOT EXISTS milestone_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id UUID REFERENCES learning_milestones(id) ON DELETE CASCADE,
    module_id UUID REFERENCES training_modules(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    UNIQUE(milestone_id, module_id)
);

-- Student progress on milestones
CREATE TABLE IF NOT EXISTS milestone_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES training_enrollments(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES learning_milestones(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'locked', -- locked, available, in_progress, completed
    progress_percentage INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(enrollment_id, milestone_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_learning_paths_batch ON learning_paths(batch_id);
CREATE INDEX IF NOT EXISTS idx_milestones_path ON learning_milestones(path_id);
CREATE INDEX IF NOT EXISTS idx_milestone_modules_milestone ON milestone_modules(milestone_id);
CREATE INDEX IF NOT EXISTS idx_milestone_progress_enrollment ON milestone_progress(enrollment_id);

-- RLS Policies
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_progress ENABLE ROW LEVEL SECURITY;

-- Service role has full access
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learning_paths' AND policyname = 'Service role full access on learning_paths') THEN
        CREATE POLICY "Service role full access on learning_paths" ON learning_paths FOR ALL TO service_role USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learning_milestones' AND policyname = 'Service role full access on learning_milestones') THEN
        CREATE POLICY "Service role full access on learning_milestones" ON learning_milestones FOR ALL TO service_role USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'milestone_modules' AND policyname = 'Service role full access on milestone_modules') THEN
        CREATE POLICY "Service role full access on milestone_modules" ON milestone_modules FOR ALL TO service_role USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'milestone_progress' AND policyname = 'Service role full access on milestone_progress') THEN
        CREATE POLICY "Service role full access on milestone_progress" ON milestone_progress FOR ALL TO service_role USING (true);
    END IF;
END
$$;

-- Function to update milestone progress when content is completed
CREATE OR REPLACE FUNCTION update_milestone_progress()
RETURNS TRIGGER AS $$
DECLARE
    v_milestone_id UUID;
    v_enrollment_id UUID;
    v_total_content INTEGER;
    v_completed_content INTEGER;
    v_progress INTEGER;
BEGIN
    -- Get enrollment from training_progress
    v_enrollment_id := NEW.enrollment_id;
    
    -- Find milestones that include the module containing this content
    FOR v_milestone_id IN
        SELECT DISTINCT mm.milestone_id 
        FROM milestone_modules mm
        JOIN training_content tc ON tc.module_id = mm.module_id
        WHERE tc.id = NEW.content_id
    LOOP
        -- Calculate progress for this milestone
        SELECT 
            COUNT(DISTINCT tc.id),
            COUNT(DISTINCT CASE WHEN tp.status = 'completed' THEN tc.id END)
        INTO v_total_content, v_completed_content
        FROM milestone_modules mm
        JOIN training_content tc ON tc.module_id = mm.module_id
        LEFT JOIN training_progress tp ON tp.content_id = tc.id AND tp.enrollment_id = v_enrollment_id
        WHERE mm.milestone_id = v_milestone_id;
        
        -- Calculate percentage
        IF v_total_content > 0 THEN
            v_progress := (v_completed_content * 100) / v_total_content;
        ELSE
            v_progress := 0;
        END IF;
        
        -- Upsert milestone progress
        INSERT INTO milestone_progress (enrollment_id, milestone_id, status, progress_percentage, started_at)
        VALUES (
            v_enrollment_id, 
            v_milestone_id, 
            CASE 
                WHEN v_progress = 100 THEN 'completed'
                WHEN v_progress > 0 THEN 'in_progress'
                ELSE 'available'
            END,
            v_progress,
            CASE WHEN v_progress > 0 THEN NOW() ELSE NULL END
        )
        ON CONFLICT (enrollment_id, milestone_id) 
        DO UPDATE SET
            progress_percentage = v_progress,
            status = CASE 
                WHEN v_progress = 100 THEN 'completed'
                WHEN v_progress > 0 THEN 'in_progress'
                ELSE milestone_progress.status
            END,
            completed_at = CASE WHEN v_progress = 100 AND milestone_progress.completed_at IS NULL THEN NOW() ELSE milestone_progress.completed_at END;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for progress updates
DROP TRIGGER IF EXISTS trigger_update_milestone_progress ON training_progress;
CREATE TRIGGER trigger_update_milestone_progress
    AFTER INSERT OR UPDATE ON training_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_milestone_progress();

