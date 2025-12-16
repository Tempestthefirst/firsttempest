-- Create enums for transaction and room types
CREATE TYPE public.transaction_type AS ENUM ('topup', 'transfer', 'send', 'receive', 'room_contribution', 'room_unlock', 'room_refund', 'hourglass_deduction');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE public.room_unlock_type AS ENUM ('target_reached', 'date_reached', 'manual');
CREATE TYPE public.room_status AS ENUM ('active', 'locked', 'unlocked', 'cancelled');
CREATE TYPE public.hourglass_status AS ENUM ('active', 'paused', 'completed', 'cancelled');
CREATE TYPE public.hourglass_recurrence AS ENUM ('daily', 'weekly', 'monthly');

-- Wallets table
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency TEXT NOT NULL DEFAULT 'NGN',
  virtual_account_number TEXT UNIQUE,
  virtual_account_bank TEXT DEFAULT 'FirstPay',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet" ON public.wallets
  FOR UPDATE USING (auth.uid() = user_id);

-- System can insert wallets (via trigger)
CREATE POLICY "System can insert wallets" ON public.wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  type public.transaction_type NOT NULL,
  status public.transaction_status NOT NULL DEFAULT 'pending',
  reference TEXT,
  description TEXT,
  room_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = from_user_id OR (type = 'topup' AND auth.uid() = to_user_id));

-- Money Rooms table
CREATE TABLE public.money_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_amount NUMERIC(15, 2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  unlock_type public.room_unlock_type NOT NULL,
  unlock_date TIMESTAMP WITH TIME ZONE,
  invite_code TEXT UNIQUE NOT NULL,
  status public.room_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.money_rooms ENABLE ROW LEVEL SECURITY;

-- Room Members table
CREATE TABLE public.room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.money_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

-- Room Contributions table
CREATE TABLE public.room_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.money_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  transaction_id UUID REFERENCES public.transactions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.room_contributions ENABLE ROW LEVEL SECURITY;

-- HourGlass Plans table
CREATE TABLE public.hourglass_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Savings Plan',
  target_amount NUMERIC(15, 2) NOT NULL CHECK (target_amount > 0),
  current_saved NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (current_saved >= 0),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  recurrence public.hourglass_recurrence NOT NULL,
  deduction_amount NUMERIC(15, 2) NOT NULL CHECK (deduction_amount > 0),
  last_deduction_date TIMESTAMP WITH TIME ZONE,
  next_deduction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status public.hourglass_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hourglass_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Money Rooms
CREATE POLICY "Members can view rooms" ON public.money_rooms
  FOR SELECT USING (
    creator_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.room_members WHERE room_id = id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create rooms" ON public.money_rooms
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update rooms" ON public.money_rooms
  FOR UPDATE USING (auth.uid() = creator_id);

-- RLS Policies for Room Members
CREATE POLICY "Members can view room members" ON public.room_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.room_members rm WHERE rm.room_id = room_id AND rm.user_id = auth.uid())
  );

CREATE POLICY "Users can join rooms" ON public.room_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Room Contributions
CREATE POLICY "Members can view contributions" ON public.room_contributions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.room_members WHERE room_id = room_contributions.room_id AND user_id = auth.uid())
  );

CREATE POLICY "Members can add contributions" ON public.room_contributions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for HourGlass Plans
CREATE POLICY "Users can view own plans" ON public.hourglass_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plans" ON public.hourglass_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" ON public.hourglass_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans" ON public.hourglass_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_money_rooms_updated_at
  BEFORE UPDATE ON public.money_rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hourglass_plans_updated_at
  BEFORE UPDATE ON public.hourglass_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create wallet for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wallets (user_id, virtual_account_number)
  VALUES (NEW.id, LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0'));
  RETURN NEW;
END;
$$;

-- Trigger to auto-create wallet on user signup
CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- Function to generate invite codes
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Indexes for performance
CREATE INDEX idx_transactions_from_user ON public.transactions(from_user_id);
CREATE INDEX idx_transactions_to_user ON public.transactions(to_user_id);
CREATE INDEX idx_transactions_room ON public.transactions(room_id);
CREATE INDEX idx_room_members_user ON public.room_members(user_id);
CREATE INDEX idx_room_contributions_room ON public.room_contributions(room_id);
CREATE INDEX idx_hourglass_plans_user ON public.hourglass_plans(user_id);
CREATE INDEX idx_money_rooms_invite_code ON public.money_rooms(invite_code);