-- Fix missing wallets for existing users
INSERT INTO public.wallets (user_id, virtual_account_number)
SELECT p.id, LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0')
FROM public.profiles p
LEFT JOIN public.wallets w ON w.user_id = p.id
WHERE w.id IS NULL;

-- Add RLS policy for user discovery (allows finding other users to send money to)
CREATE POLICY "Authenticated users can view basic profile info for transfers"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Drop the old restrictive policy and replace
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Re-create with same name but keep it for backwards compatibility
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Add demo_mode feature flag
INSERT INTO public.feature_flags (name, description, enabled, metadata)
VALUES ('demo_mode', 'Enable demo mode with simulated money', true, '{"seed_balance": 50000}'::jsonb)
ON CONFLICT (name) DO UPDATE SET enabled = true;

-- Seed starting balance for all existing wallets (demo mode)
UPDATE public.wallets 
SET balance = 50000 
WHERE balance = 0;

-- Create transaction records for the demo seed
INSERT INTO public.transactions (to_user_id, amount, type, status, description, reference, completed_at)
SELECT w.user_id, 50000, 'topup', 'completed', 'Demo account credit', 'DEMO' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'), now()
FROM public.wallets w
WHERE NOT EXISTS (
  SELECT 1 FROM public.transactions t 
  WHERE t.to_user_id = w.user_id 
  AND t.description = 'Demo account credit'
);