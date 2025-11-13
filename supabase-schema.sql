-- Supabase Database Schema for Talent Marketplace
-- Run this SQL in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('freelancer', 'client')),
  display_name TEXT NOT NULL,
  wallet_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Freelancer fields
  bio TEXT,
  skills TEXT[],
  hourly_rate NUMERIC,
  portfolio TEXT,
  availability TEXT CHECK (availability IN ('available', 'busy', 'unavailable')),
  
  -- Client fields
  company_name TEXT,
  company_website TEXT,
  industry TEXT,
  
  -- Common fields
  profile_image TEXT,
  location TEXT,
  timezone TEXT,
  verified BOOLEAN DEFAULT FALSE
);

-- Jobs table
CREATE TABLE jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  skills TEXT[] NOT NULL,
  budget NUMERIC NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('fixed-price', 'hourly')),
  experience_level TEXT NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'expert')),
  duration TEXT NOT NULL,
  
  -- Client info
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_address TEXT,
  
  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'completed', 'cancelled')),
  featured BOOLEAN DEFAULT FALSE,
  
  -- Applications
  applicants TEXT[],
  selected_freelancer TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deadline TIMESTAMPTZ,
  
  -- Additional
  attachments TEXT[],
  location TEXT,
  remote BOOLEAN DEFAULT FALSE
);

-- Reviews table (blockchain integration)
CREATE TABLE aqua_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  reviewer_uid TEXT NOT NULL,
  reviewee_uid TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Blockchain data
  token_id TEXT,
  contract_address TEXT,
  transaction_hash TEXT,
  chain_id INTEGER
);

-- Create indexes
CREATE INDEX idx_users_uid ON users(uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_reviews_job_id ON aqua_reviews(job_id);

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE aqua_reviews ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = uid);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid()::text = uid);

-- Jobs policies
CREATE POLICY "Anyone can view jobs"
  ON jobs FOR SELECT
  USING (true);

CREATE POLICY "Clients can create jobs"
  ON jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE uid = auth.uid()::text
      AND role = 'client'
    )
  );

CREATE POLICY "Clients can update own jobs"
  ON jobs FOR UPDATE
  USING (client_id = auth.uid()::text);

CREATE POLICY "Clients can delete own jobs"
  ON jobs FOR DELETE
  USING (client_id = auth.uid()::text);

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
  ON aqua_reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON aqua_reviews FOR INSERT
  WITH CHECK (auth.uid()::text = reviewer_uid);
