-- Enhanced Database Schema with Escrow and Payment Support
-- Run this in your Supabase SQL Editor

-- Add payment and escrow fields to jobs table
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS service_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS escrow_status TEXT DEFAULT 'not_funded',
ADD COLUMN IF NOT EXISTS escrow_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'crypto';

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  method_type TEXT NOT NULL CHECK (method_type IN ('crypto', 'bank', 'mpesa')),
  is_default BOOLEAN DEFAULT false,
  
  -- Crypto fields
  wallet_address TEXT,
  blockchain TEXT,
  
  -- Bank fields
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  bank_code TEXT,
  
  -- M-Pesa fields
  phone_number TEXT,
  mpesa_name TEXT,
  
  -- Common fields
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create escrow table
CREATE TABLE IF NOT EXISTS escrow (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES users(uid),
  freelancer_id TEXT REFERENCES users(uid),
  
  -- Amount details
  project_amount NUMERIC NOT NULL,
  service_fee NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  
  -- Escrow status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'funded', 'released', 'refunded', 'disputed')),
  
  -- Payment details
  payment_method TEXT NOT NULL CHECK (payment_method IN ('crypto', 'bank', 'mpesa')),
  transaction_hash TEXT,
  blockchain TEXT,
  
  -- Timestamps
  funded_at TIMESTAMP WITH TIME ZONE,
  released_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(uid),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  escrow_id UUID REFERENCES escrow(id) ON DELETE SET NULL,
  
  -- Transaction details
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'escrow_fund', 'escrow_release', 'refund', 'service_fee')),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Payment method
  payment_method TEXT NOT NULL CHECK (payment_method IN ('crypto', 'bank', 'mpesa')),
  transaction_hash TEXT,
  blockchain TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  
  -- Metadata
  description TEXT,
  metadata JSONB,
  
  -- Timestamps
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_escrow_job_id ON escrow(job_id);
CREATE INDEX IF NOT EXISTS idx_escrow_client_id ON escrow(client_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_job_id ON transactions(job_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Row Level Security Policies

-- Payment Methods Policies
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment methods"
  ON payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods"
  ON payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods"
  ON payment_methods FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
  ON payment_methods FOR DELETE
  USING (auth.uid() = user_id);

-- Escrow Policies
ALTER TABLE escrow ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view related escrow"
  ON escrow FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = freelancer_id);

CREATE POLICY "Clients can create escrow"
  ON escrow FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "System can update escrow"
  ON escrow FOR UPDATE
  USING (auth.uid() = client_id OR auth.uid() = freelancer_id);

-- Transactions Policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Functions for escrow management

-- Function to fund escrow
CREATE OR REPLACE FUNCTION fund_escrow(
  p_job_id UUID,
  p_client_id TEXT,
  p_project_amount NUMERIC,
  p_service_fee NUMERIC,
  p_payment_method TEXT,
  p_transaction_hash TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_escrow_id UUID;
  v_total_amount NUMERIC;
BEGIN
  v_total_amount := p_project_amount + p_service_fee;
  
  -- Create escrow record
  INSERT INTO escrow (
    job_id,
    client_id,
    project_amount,
    service_fee,
    total_amount,
    status,
    payment_method,
    transaction_hash,
    funded_at
  ) VALUES (
    p_job_id,
    p_client_id,
    p_project_amount,
    p_service_fee,
    v_total_amount,
    'funded',
    p_payment_method,
    p_transaction_hash,
    NOW()
  ) RETURNING id INTO v_escrow_id;
  
  -- Update job status
  UPDATE jobs SET 
    escrow_status = 'funded',
    payment_status = 'paid',
    escrow_tx_hash = p_transaction_hash,
    total_amount = v_total_amount,
    service_fee = p_service_fee
  WHERE id = p_job_id;
  
  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    job_id,
    escrow_id,
    type,
    amount,
    payment_method,
    transaction_hash,
    status,
    description,
    completed_at
  ) VALUES (
    p_client_id,
    p_job_id,
    v_escrow_id,
    'escrow_fund',
    v_total_amount,
    p_payment_method,
    p_transaction_hash,
    'completed',
    'Funds deposited to escrow for job',
    NOW()
  );
  
  RETURN v_escrow_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to release escrow to freelancer
CREATE OR REPLACE FUNCTION release_escrow(
  p_escrow_id UUID,
  p_freelancer_id TEXT,
  p_release_tx_hash TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_escrow_record RECORD;
BEGIN
  -- Get escrow details
  SELECT * INTO v_escrow_record FROM escrow WHERE id = p_escrow_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Escrow not found';
  END IF;
  
  IF v_escrow_record.status != 'funded' THEN
    RAISE EXCEPTION 'Escrow is not in funded status';
  END IF;
  
  -- Update escrow status
  UPDATE escrow SET
    status = 'released',
    freelancer_id = p_freelancer_id,
    released_at = NOW(),
    updated_at = NOW()
  WHERE id = p_escrow_id;
  
  -- Update job
  UPDATE jobs SET
    escrow_status = 'released',
    status = 'completed'
  WHERE id = v_escrow_record.job_id;
  
  -- Create release transaction
  INSERT INTO transactions (
    user_id,
    job_id,
    escrow_id,
    type,
    amount,
    payment_method,
    transaction_hash,
    status,
    description,
    completed_at
  ) VALUES (
    p_freelancer_id,
    v_escrow_record.job_id,
    p_escrow_id,
    'escrow_release',
    v_escrow_record.project_amount,
    v_escrow_record.payment_method,
    p_release_tx_hash,
    'completed',
    'Escrow funds released to freelancer',
    NOW()
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refund escrow to client
CREATE OR REPLACE FUNCTION refund_escrow(
  p_escrow_id UUID,
  p_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_escrow_record RECORD;
BEGIN
  SELECT * INTO v_escrow_record FROM escrow WHERE id = p_escrow_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Escrow not found';
  END IF;
  
  -- Update escrow status
  UPDATE escrow SET
    status = 'refunded',
    refunded_at = NOW(),
    notes = p_reason,
    updated_at = NOW()
  WHERE id = p_escrow_id;
  
  -- Update job
  UPDATE jobs SET
    escrow_status = 'refunded',
    status = 'cancelled'
  WHERE id = v_escrow_record.job_id;
  
  -- Create refund transaction
  INSERT INTO transactions (
    user_id,
    job_id,
    escrow_id,
    type,
    amount,
    payment_method,
    status,
    description,
    completed_at
  ) VALUES (
    v_escrow_record.client_id,
    v_escrow_record.job_id,
    p_escrow_id,
    'refund',
    v_escrow_record.total_amount,
    v_escrow_record.payment_method,
    'completed',
    'Escrow refunded: ' || COALESCE(p_reason, 'Job cancelled'),
    NOW()
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE payment_methods IS 'Stores user payment methods (crypto wallets, bank accounts, M-Pesa)';
COMMENT ON TABLE escrow IS 'Manages escrow for job payments';
COMMENT ON TABLE transactions IS 'Records all financial transactions';
COMMENT ON FUNCTION fund_escrow IS 'Deposits funds into escrow for a job';
COMMENT ON FUNCTION release_escrow IS 'Releases escrow funds to freelancer upon job completion';
COMMENT ON FUNCTION refund_escrow IS 'Refunds escrow funds to client if job is cancelled';
