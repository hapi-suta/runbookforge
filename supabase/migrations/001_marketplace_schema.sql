-- RunbookForge Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- CATEGORIES TABLE (for organizing runbooks and documents)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'runbook', -- 'runbook' or 'document'
  color TEXT DEFAULT 'teal',
  icon TEXT DEFAULT 'folder',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name, type)
);

-- ============================================
-- DOCUMENTS TABLE (for PPTs, PDFs, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_type TEXT NOT NULL DEFAULT 'pptx', -- 'pptx', 'pdf', 'docx'
  file_url TEXT, -- Storage URL or base64 data
  file_size INTEGER, -- in bytes
  slide_count INTEGER,
  thumbnail_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}', -- Additional metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add category support to runbooks (run separately if runbooks table exists)
-- ALTER TABLE runbooks ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- ============================================
-- MARKETPLACE LISTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  runbook_id UUID NOT NULL REFERENCES runbooks(id) ON DELETE CASCADE,
  creator_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price_personal INTEGER NOT NULL DEFAULT 2500, -- in cents ($25.00)
  price_team INTEGER, -- 3x personal
  price_enterprise INTEGER, -- 10x personal
  category TEXT NOT NULL DEFAULT 'Other',
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, archived
  rejection_reason TEXT,
  preview_content JSONB, -- First section for preview
  sales_count INTEGER DEFAULT 0,
  rating_sum INTEGER DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PURCHASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id TEXT NOT NULL,
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id),
  runbook_id UUID NOT NULL REFERENCES runbooks(id),
  stripe_payment_intent_id TEXT,
  license_type TEXT NOT NULL DEFAULT 'personal', -- personal, team, enterprise
  amount_paid INTEGER NOT NULL, -- in cents
  creator_payout INTEGER NOT NULL, -- 70%
  platform_fee INTEGER NOT NULL, -- 30%
  payout_status TEXT DEFAULT 'pending', -- pending, processing, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CREATOR ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS creator_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  stripe_account_id TEXT,
  stripe_account_status TEXT DEFAULT 'pending', -- pending, active, restricted
  payouts_enabled BOOLEAN DEFAULT FALSE,
  total_earnings INTEGER DEFAULT 0, -- in cents
  pending_balance INTEGER DEFAULT 0, -- in cents
  total_sales INTEGER DEFAULT 0,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CREATOR PAYOUTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS creator_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id TEXT NOT NULL,
  stripe_transfer_id TEXT,
  amount INTEGER NOT NULL, -- in cents
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  purchase_ids UUID[] DEFAULT '{}',
  payout_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  buyer_id TEXT NOT NULL,
  purchase_id UUID REFERENCES purchases(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, buyer_id)
);

-- ============================================
-- SUBSCRIPTION PLANS TABLE (for future use)
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free', -- free, pro, team, enterprise
  status TEXT NOT NULL DEFAULT 'active', -- active, past_due, canceled, trialing
  billing_cycle TEXT DEFAULT 'monthly', -- monthly, yearly
  seats INTEGER DEFAULT 1,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USAGE TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS usage_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  quota_type TEXT NOT NULL, -- ai_generations, ai_imports, storage_mb
  used INTEGER DEFAULT 0,
  limit_amount INTEGER NOT NULL,
  reset_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quota_type)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_listings_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_creator ON marketplace_listings(creator_id);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON marketplace_listings(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_listing ON purchases(listing_id);
CREATE INDEX IF NOT EXISTS idx_creator_accounts_user ON creator_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_listing ON reviews(listing_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_quotas ENABLE ROW LEVEL SECURITY;

-- Marketplace Listings: Anyone can view approved, creators can manage their own
CREATE POLICY "Public can view approved listings" ON marketplace_listings
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Creators can view their own listings" ON marketplace_listings
  FOR SELECT USING (auth.uid()::text = creator_id);

CREATE POLICY "Creators can insert listings" ON marketplace_listings
  FOR INSERT WITH CHECK (auth.uid()::text = creator_id);

CREATE POLICY "Creators can update their own listings" ON marketplace_listings
  FOR UPDATE USING (auth.uid()::text = creator_id);

-- Purchases: Buyers can view their own
CREATE POLICY "Buyers can view their purchases" ON purchases
  FOR SELECT USING (auth.uid()::text = buyer_id);

CREATE POLICY "Anyone can insert purchases" ON purchases
  FOR INSERT WITH CHECK (true);

-- Creator Accounts: Users can manage their own
CREATE POLICY "Users can view their creator account" ON creator_accounts
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their creator account" ON creator_accounts
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their creator account" ON creator_accounts
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Reviews: Anyone can view, buyers can create
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Buyers can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid()::text = buyer_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update listing stats after a sale
CREATE OR REPLACE FUNCTION update_listing_sales()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE marketplace_listings
  SET sales_count = sales_count + 1,
      updated_at = NOW()
  WHERE id = NEW.listing_id;
  
  UPDATE creator_accounts
  SET total_earnings = total_earnings + NEW.creator_payout,
      pending_balance = pending_balance + NEW.creator_payout,
      total_sales = total_sales + 1,
      updated_at = NOW()
  WHERE user_id = (SELECT creator_id FROM marketplace_listings WHERE id = NEW.listing_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sales
DROP TRIGGER IF EXISTS on_purchase_created ON purchases;
CREATE TRIGGER on_purchase_created
  AFTER INSERT ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_sales();

-- Function to update rating after review
CREATE OR REPLACE FUNCTION update_listing_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE marketplace_listings
  SET rating_sum = rating_sum + NEW.rating,
      rating_count = rating_count + 1,
      updated_at = NOW()
  WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reviews
DROP TRIGGER IF EXISTS on_review_created ON reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_rating();

-- ============================================
-- INITIAL DATA / SEED (Optional)
-- ============================================

-- You can add seed data here if needed

-- ============================================
-- SHARES TABLE (for sharing documents/runbooks)
-- ============================================
CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL,
  shared_with_email TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- 'document' or 'runbook'
  resource_id UUID NOT NULL,
  permission TEXT NOT NULL DEFAULT 'view', -- 'view', 'edit', 'download'
  accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(shared_with_email, resource_type, resource_id)
);

-- Disable RLS for shares (we handle auth in API)
ALTER TABLE shares DISABLE ROW LEVEL SECURITY;
