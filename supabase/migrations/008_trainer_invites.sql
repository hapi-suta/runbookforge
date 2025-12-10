-- Trainer invites table
CREATE TABLE IF NOT EXISTS trainer_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role text DEFAULT 'trainer' CHECK (role IN ('trainer', 'admin')),
  invite_token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  ai_approved boolean DEFAULT true,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trainer_invites_email ON trainer_invites(email);
CREATE INDEX IF NOT EXISTS idx_trainer_invites_token ON trainer_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_trainer_invites_status ON trainer_invites(status);

ALTER TABLE trainer_invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access invites" ON trainer_invites;
CREATE POLICY "Service role full access invites" ON trainer_invites FOR ALL USING (true);

-- Access requests table
CREATE TABLE IF NOT EXISTS trainer_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  email text NOT NULL,
  name text,
  reason text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by text,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_access_requests_user ON trainer_access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON trainer_access_requests(status);

ALTER TABLE trainer_access_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access requests" ON trainer_access_requests;
CREATE POLICY "Service role full access requests" ON trainer_access_requests FOR ALL USING (true);

