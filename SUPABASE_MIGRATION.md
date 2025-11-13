# Supabase Migration Guide

## 🎯 Overview

This guide will help you migrate from Firebase to Supabase while keeping all existing features working.

## 📋 Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new project (takes ~2 minutes to provision)

---

## 🚀 Step 1: Get Supabase Credentials

1. Go to https://app.supabase.com/
2. Select your project
3. Click "Settings" (⚙️) → "API"
4. Copy these values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public** key (looks like: `eyJhbGci...`)

5. Update your `.env` file:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 🗄️ Step 2: Create Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Paste and run this SQL:

```sql
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

-- Reviews table (for blockchain integration)
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

-- Create indexes for better performance
CREATE INDEX idx_users_uid ON users(uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_reviews_job_id ON aqua_reviews(job_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔒 Step 3: Configure Row Level Security (RLS)

Run this SQL to set up security policies:

```sql
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
```

---

## ⚙️ Step 4: Enable Email Authentication

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Make sure **Email** is enabled
3. (Optional) Configure email templates under **Email Templates**

---

## 🔄 Step 5: Switch to Supabase Code

Now that the database is ready, update your imports:

### Replace imports in all files:

**Before (Firebase):**
```typescript
import { signUp, signIn, signOut } from '../lib/auth';
import { createJob, getOpenJobs } from '../lib/jobs';
import { AuthProvider, useAuth } from '../context/AuthContext';
```

**After (Supabase):**
```typescript
import { signUp, signIn, signOut } from '../lib/auth-supabase';
import { createJob, getOpenJobs } from '../lib/jobs-supabase';
import { AuthProvider, useAuth } from '../context/AuthContext-supabase';
```

### Files to update:
1. `src/pages/SignUpPage.tsx` - Change import from `'../lib/auth'` to `'../lib/auth-supabase'`
2. `src/pages/SignInPage.tsx` - Same as above
3. `src/pages/PostJobPage.tsx` - Change from `'../lib/jobs'` to `'../lib/jobs-supabase'`
4. `src/pages/JobDetailPage.tsx` - Same as above
5. `src/components/FreelancerDashboard.tsx` - Same as above
6. `src/components/ClientDashboard.tsx` - Same as above
7. `src/App.tsx` - Change from `'./context/AuthContext'` to `'./context/AuthContext-supabase'`

---

## 🧪 Step 6: Test the Migration

1. Restart your dev server:
```bash
npm run dev
```

2. Test signup flow:
   - Go to http://localhost:5173/signup
   - Create a new account (freelancer or client)
   - Verify you're redirected to dashboard

3. Test signin flow:
   - Sign out
   - Sign in with the account you just created

4. Test job posting (as client):
   - Post a new job
   - Verify it appears in dashboard

5. Test job application (as freelancer):
   - Create a freelancer account
   - Browse jobs
   - Apply to a job

---

## 📊 Step 7: Migrate Existing Data (Optional)

If you have existing Firebase data to migrate:

1. Export data from Firebase Firestore
2. Transform field names (camelCase → snake_case):
   - `displayName` → `display_name`
   - `walletAddress` → `wallet_address`
   - `createdAt` → `created_at`
   - etc.
3. Import to Supabase using SQL INSERT statements or the dashboard

---

## 🎨 Step 8: Update Field Names in Components

Since Supabase uses snake_case, update your components:

**Before:**
```typescript
userProfile.displayName
userProfile.walletAddress
job.jobType
job.experienceLevel
```

**After:**
```typescript
userProfile.display_name
userProfile.wallet_address
job.job_type
job.experience_level
```

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Environment variables added to `.env`
- [ ] Database schema created (users, jobs, aqua_reviews tables)
- [ ] RLS policies configured
- [ ] Email authentication enabled
- [ ] All imports updated to use `-supabase` files
- [ ] Dev server running without errors
- [ ] Signup works
- [ ] Signin works
- [ ] Job posting works
- [ ] Job application works

---

## 🔥 Step 9: Clean Up (After Successful Migration)

Once everything works with Supabase:

1. Remove Firebase files:
```bash
rm src/lib/firebase.ts
rm src/lib/auth.ts
rm src/lib/jobs.ts
rm src/context/AuthContext.tsx
```

2. Rename Supabase files (remove `-supabase` suffix):
```bash
mv src/lib/auth-supabase.ts src/lib/auth.ts
mv src/lib/jobs-supabase.ts src/lib/jobs.ts
mv src/context/AuthContext-supabase.tsx src/context/AuthContext.tsx
```

3. Uninstall Firebase:
```bash
npm uninstall firebase
```

4. Remove Firebase env variables from `.env`

---

## 🚀 Deploy to Vercel

Add Supabase environment variables to Vercel:

1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Redeploy

---

## 🔗 Blockchain Integration

Supabase works great with blockchain! You can:

1. **Store wallet addresses** in user profiles
2. **Store contract addresses** in jobs table
3. **Listen to blockchain events** and update database
4. **Use Supabase Edge Functions** to interact with smart contracts

Example:
```typescript
// In your job creation flow
const txHash = await escrowContract.createEscrow(jobId, amount);

await supabase.from('jobs').update({
  escrow_contract: contractAddress,
  transaction_hash: txHash
}).eq('id', jobId);
```

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

---

## 🆘 Troubleshooting

**Issue: "Failed to fetch"**
- Check if Supabase URL is correct
- Verify anon key is set

**Issue: "JWT expired"**
- Supabase auto-refreshes tokens
- Try signing out and signing in again

**Issue: "Permission denied"**
- Check RLS policies
- Verify user is authenticated

**Issue: TypeScript errors**
- Run `npm install` to update types
- Restart TypeScript server in VS Code

---

**Need help? Check the Supabase Discord or GitHub discussions!**
