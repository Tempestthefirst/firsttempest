-- =====================================================
-- FINTECH MVP BACKEND UPGRADE
-- =====================================================

-- 1. ACCOUNT STATES ENUM
CREATE TYPE public.account_status AS ENUM ('active', 'suspended', 'pending_verification', 'locked');

-- 2. UPDATE PROFILES TABLE - Add account status and profile completeness
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_status public.account_status DEFAULT 'active',
ADD COLUMN IF NOT EXISTS profile_completeness INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS failed_pin_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pin_locked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS daily_transfer_total NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_transfer_reset_at DATE DEFAULT CURRENT_DATE;

-- 3. UPDATE WALLETS TABLE - Add pending balance
ALTER TABLE public.wallets
ADD COLUMN IF NOT EXISTS pending_balance NUMERIC DEFAULT 0;

-- 4. UPDATE TRANSACTIONS TABLE - Add more metadata
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS failed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS failure_reason TEXT,
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS device_info TEXT;

-- 5. ACTIVITY LOGS TABLE (Audit Trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  device_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only view their own logs (read-only)
CREATE POLICY "Users can view own activity logs"
ON public.activity_logs
FOR SELECT
USING (auth.uid() = user_id);

-- RLS: System can insert logs (using security definer function)
CREATE POLICY "System can insert activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 6. FEATURE FLAGS TABLE
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on feature_flags
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- RLS: Everyone can read feature flags
CREATE POLICY "Anyone can view feature flags"
ON public.feature_flags
FOR SELECT
USING (true);

-- RLS: Only admins can modify feature flags
CREATE POLICY "Admins can manage feature flags"
ON public.feature_flags
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Insert default feature flags
INSERT INTO public.feature_flags (name, description, enabled) VALUES
  ('hourglass', 'HourGlass savings feature', true),
  ('money_rooms', 'Money Rooms group savings feature', true),
  ('card_payments', 'Card payment funding method', true),
  ('bank_transfers', 'Bank transfer funding method', true)
ON CONFLICT (name) DO NOTHING;

-- 7. TRANSACTION LIMITS TABLE
CREATE TABLE IF NOT EXISTS public.transaction_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  daily_limit NUMERIC NOT NULL DEFAULT 1000000,
  per_transaction_limit NUMERIC NOT NULL DEFAULT 500000,
  min_transaction NUMERIC NOT NULL DEFAULT 100,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transaction_limits ENABLE ROW LEVEL SECURITY;

-- RLS: Everyone can read limits
CREATE POLICY "Anyone can view transaction limits"
ON public.transaction_limits
FOR SELECT
USING (true);

-- RLS: Only admins can modify limits
CREATE POLICY "Admins can manage transaction limits"
ON public.transaction_limits
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Insert default limits
INSERT INTO public.transaction_limits (name, daily_limit, per_transaction_limit, min_transaction, description) VALUES
  ('default', 1000000, 500000, 100, 'Default transaction limits for all users'),
  ('verified', 5000000, 2000000, 100, 'Limits for verified users')
ON CONFLICT (name) DO NOTHING;

-- 8. GENERATE UNIQUE TRANSACTION REFERENCE FUNCTION
CREATE OR REPLACE FUNCTION public.generate_transaction_reference()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  result TEXT := 'TXN';
  i INTEGER;
BEGIN
  -- Add timestamp component (YYMMDDHHMMSS)
  result := result || TO_CHAR(now(), 'YYMMDDHH24MISS');
  -- Add random suffix
  FOR i IN 1..6 LOOP
    result := result || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- 9. LOG ACTIVITY FUNCTION (Security Definer)
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO activity_logs (user_id, action, resource_type, resource_id, metadata)
  VALUES (auth.uid(), p_action, p_resource_type, p_resource_id, p_metadata)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- 10. UPDATE PROFILE COMPLETENESS FUNCTION
CREATE OR REPLACE FUNCTION public.calculate_profile_completeness(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_score INTEGER := 0;
  v_profile profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  
  IF v_profile.id IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Full name (20%)
  IF v_profile.full_name IS NOT NULL AND LENGTH(v_profile.full_name) > 2 THEN
    v_score := v_score + 20;
  END IF;
  
  -- Phone number (20%)
  IF v_profile.phone_number IS NOT NULL AND LENGTH(v_profile.phone_number) >= 10 THEN
    v_score := v_score + 20;
  END IF;
  
  -- PIN set (30%)
  IF v_profile.pin_hash IS NOT NULL THEN
    v_score := v_score + 30;
  END IF;
  
  -- Identity verified (30%)
  IF v_profile.is_verified = true THEN
    v_score := v_score + 30;
  END IF;
  
  -- Update the profile
  UPDATE profiles SET profile_completeness = v_score WHERE id = p_user_id;
  
  RETURN v_score;
END;
$$;

-- 11. CHECK PIN WITH RATE LIMITING FUNCTION
CREATE OR REPLACE FUNCTION public.verify_pin_with_limit(p_pin_hash TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile profiles%ROWTYPE;
  v_max_attempts INTEGER := 5;
  v_lockout_minutes INTEGER := 30;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id = auth.uid();
  
  IF v_profile.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Profile not found');
  END IF;
  
  -- Check if locked
  IF v_profile.pin_locked_until IS NOT NULL AND v_profile.pin_locked_until > now() THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'PIN temporarily locked', 
      'locked_until', v_profile.pin_locked_until,
      'minutes_remaining', EXTRACT(EPOCH FROM (v_profile.pin_locked_until - now())) / 60
    );
  END IF;
  
  -- Verify PIN
  IF v_profile.pin_hash = p_pin_hash THEN
    -- Reset failed attempts on success
    UPDATE profiles 
    SET failed_pin_attempts = 0, pin_locked_until = NULL 
    WHERE id = auth.uid();
    
    -- Log successful verification
    PERFORM log_activity('pin_verified', 'profile', auth.uid());
    
    RETURN json_build_object('success', true);
  ELSE
    -- Increment failed attempts
    UPDATE profiles 
    SET failed_pin_attempts = failed_pin_attempts + 1,
        pin_locked_until = CASE 
          WHEN failed_pin_attempts + 1 >= v_max_attempts 
          THEN now() + (v_lockout_minutes || ' minutes')::interval 
          ELSE NULL 
        END
    WHERE id = auth.uid();
    
    -- Log failed attempt
    PERFORM log_activity('pin_failed', 'profile', auth.uid(), 
      json_build_object('attempts', v_profile.failed_pin_attempts + 1)::jsonb);
    
    IF v_profile.failed_pin_attempts + 1 >= v_max_attempts THEN
      RETURN json_build_object(
        'success', false, 
        'error', 'Too many failed attempts. PIN locked for ' || v_lockout_minutes || ' minutes',
        'locked', true
      );
    END IF;
    
    RETURN json_build_object(
      'success', false, 
      'error', 'Invalid PIN',
      'attempts_remaining', v_max_attempts - (v_profile.failed_pin_attempts + 1)
    );
  END IF;
END;
$$;

-- 12. ENHANCED TRANSFER WITH LIMITS AND LOGGING
CREATE OR REPLACE FUNCTION public.transfer_money_v2(
  p_to_user_id UUID, 
  p_amount NUMERIC, 
  p_description TEXT DEFAULT NULL,
  p_pin_hash TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from_balance NUMERIC;
  v_transaction_id UUID;
  v_reference TEXT;
  v_profile profiles%ROWTYPE;
  v_limits transaction_limits%ROWTYPE;
  v_daily_total NUMERIC;
BEGIN
  -- Get sender profile
  SELECT * INTO v_profile FROM profiles WHERE id = auth.uid();
  
  -- Check account status
  IF v_profile.account_status != 'active' THEN
    RETURN json_build_object('success', false, 'error', 'Account is not active');
  END IF;
  
  -- Verify PIN if provided
  IF p_pin_hash IS NOT NULL THEN
    IF v_profile.pin_hash != p_pin_hash THEN
      -- Increment failed attempts
      UPDATE profiles 
      SET failed_pin_attempts = failed_pin_attempts + 1,
          pin_locked_until = CASE 
            WHEN failed_pin_attempts + 1 >= 5 
            THEN now() + '30 minutes'::interval 
            ELSE NULL 
          END
      WHERE id = auth.uid();
      
      RETURN json_build_object('success', false, 'error', 'Invalid PIN');
    END IF;
    
    -- Reset failed attempts
    UPDATE profiles SET failed_pin_attempts = 0, pin_locked_until = NULL WHERE id = auth.uid();
  END IF;
  
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;
  
  -- Get limits
  SELECT * INTO v_limits FROM transaction_limits 
  WHERE name = CASE WHEN v_profile.is_verified THEN 'verified' ELSE 'default' END;
  
  -- Check per-transaction limit
  IF p_amount > v_limits.per_transaction_limit THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Amount exceeds per-transaction limit of ₦' || v_limits.per_transaction_limit::TEXT
    );
  END IF;
  
  -- Check minimum transaction
  IF p_amount < v_limits.min_transaction THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Minimum transaction amount is ₦' || v_limits.min_transaction::TEXT
    );
  END IF;
  
  -- Reset daily total if new day
  IF v_profile.daily_transfer_reset_at < CURRENT_DATE THEN
    UPDATE profiles 
    SET daily_transfer_total = 0, daily_transfer_reset_at = CURRENT_DATE 
    WHERE id = auth.uid();
    v_profile.daily_transfer_total := 0;
  END IF;
  
  -- Check daily limit
  IF v_profile.daily_transfer_total + p_amount > v_limits.daily_limit THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Daily transfer limit exceeded. Remaining: ₦' || (v_limits.daily_limit - v_profile.daily_transfer_total)::TEXT
    );
  END IF;
  
  -- Check sender balance
  SELECT balance INTO v_from_balance
  FROM wallets
  WHERE user_id = auth.uid()
  FOR UPDATE;
  
  IF v_from_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Wallet not found');
  END IF;
  
  IF v_from_balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  -- Check recipient exists
  IF NOT EXISTS (SELECT 1 FROM wallets WHERE user_id = p_to_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Recipient not found');
  END IF;
  
  -- Generate unique reference
  v_reference := generate_transaction_reference();
  
  -- Deduct from sender
  UPDATE wallets
  SET balance = balance - p_amount, updated_at = now()
  WHERE user_id = auth.uid();
  
  -- Add to recipient
  UPDATE wallets
  SET balance = balance + p_amount, updated_at = now()
  WHERE user_id = p_to_user_id;
  
  -- Update daily total
  UPDATE profiles
  SET daily_transfer_total = daily_transfer_total + p_amount
  WHERE id = auth.uid();
  
  -- Create transaction record
  INSERT INTO transactions (
    from_user_id, to_user_id, amount, type, status, description, 
    reference, completed_at
  )
  VALUES (
    auth.uid(), p_to_user_id, p_amount, 'transfer', 'completed', p_description,
    v_reference, now()
  )
  RETURNING id INTO v_transaction_id;
  
  -- Log activity
  PERFORM log_activity('transfer_sent', 'transaction', v_transaction_id,
    json_build_object('amount', p_amount, 'to_user', p_to_user_id)::jsonb);
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'reference', v_reference,
    'new_balance', v_from_balance - p_amount
  );
END;
$$;

-- 13. GET FEATURE FLAG FUNCTION
CREATE OR REPLACE FUNCTION public.is_feature_enabled(p_feature_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN COALESCE(
    (SELECT enabled FROM feature_flags WHERE name = p_feature_name),
    false
  );
END;
$$;

-- 14. UPDATE LAST LOGIN FUNCTION
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles 
  SET last_login_at = now() 
  WHERE id = auth.uid();
  
  -- Calculate and update profile completeness
  PERFORM calculate_profile_completeness(auth.uid());
  
  -- Log activity
  PERFORM log_activity('login', 'session', NULL);
  
  RETURN json_build_object('success', true);
END;
$$;

-- 15. RESET PIN WITH VERIFICATION
CREATE OR REPLACE FUNCTION public.reset_pin_secure(
  p_phone TEXT,
  p_old_pin_hash TEXT,
  p_new_pin_hash TEXT,
  p_new_pin_salt TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile profiles%ROWTYPE;
  v_phone_clean TEXT;
BEGIN
  -- Normalize phone
  v_phone_clean := regexp_replace(p_phone, '[^0-9]', '', 'g');
  IF v_phone_clean LIKE '234%' AND length(v_phone_clean) > 10 THEN
    v_phone_clean := '0' || substring(v_phone_clean from 4);
  END IF;
  IF length(v_phone_clean) = 10 AND v_phone_clean NOT LIKE '0%' THEN
    v_phone_clean := '0' || v_phone_clean;
  END IF;
  
  -- Get profile
  SELECT * INTO v_profile FROM profiles WHERE phone_number = v_phone_clean;
  
  IF v_profile.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Account not found');
  END IF;
  
  -- Check if locked
  IF v_profile.pin_locked_until IS NOT NULL AND v_profile.pin_locked_until > now() THEN
    RETURN json_build_object('success', false, 'error', 'PIN temporarily locked');
  END IF;
  
  -- Verify old PIN
  IF v_profile.pin_hash != p_old_pin_hash THEN
    UPDATE profiles 
    SET failed_pin_attempts = failed_pin_attempts + 1
    WHERE id = v_profile.id;
    
    RETURN json_build_object('success', false, 'error', 'Current PIN is incorrect');
  END IF;
  
  -- Update PIN
  UPDATE profiles 
  SET 
    pin_hash = p_new_pin_hash, 
    pin_salt = p_new_pin_salt,
    failed_pin_attempts = 0,
    pin_locked_until = NULL
  WHERE id = v_profile.id;
  
  -- Log activity
  PERFORM log_activity('pin_changed', 'profile', v_profile.id);
  
  RETURN json_build_object('success', true, 'message', 'PIN updated successfully');
END;
$$;

-- Enable realtime for activity_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;