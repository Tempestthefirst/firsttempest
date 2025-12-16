-- Secure RPC function: Get wallet with balance
CREATE OR REPLACE FUNCTION public.get_my_wallet()
RETURNS TABLE (
  id UUID,
  balance NUMERIC,
  currency TEXT,
  virtual_account_number TEXT,
  virtual_account_bank TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT w.id, w.balance, w.currency, w.virtual_account_number, w.virtual_account_bank
  FROM wallets w
  WHERE w.user_id = auth.uid();
END;
$$;

-- Secure RPC function: Transfer money between users
CREATE OR REPLACE FUNCTION public.transfer_money(
  p_to_user_id UUID,
  p_amount NUMERIC,
  p_description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from_balance NUMERIC;
  v_transaction_id UUID;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
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
  
  -- Deduct from sender
  UPDATE wallets
  SET balance = balance - p_amount, updated_at = now()
  WHERE user_id = auth.uid();
  
  -- Add to recipient
  UPDATE wallets
  SET balance = balance + p_amount, updated_at = now()
  WHERE user_id = p_to_user_id;
  
  -- Create transaction record
  INSERT INTO transactions (from_user_id, to_user_id, amount, type, status, description)
  VALUES (auth.uid(), p_to_user_id, p_amount, 'transfer', 'completed', p_description)
  RETURNING id INTO v_transaction_id;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'new_balance', v_from_balance - p_amount
  );
END;
$$;

-- Secure RPC function: Top up wallet (simulated - in production this would verify payment)
CREATE OR REPLACE FUNCTION public.topup_wallet(
  p_amount NUMERIC,
  p_reference TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance NUMERIC;
  v_transaction_id UUID;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;
  
  -- Update balance
  UPDATE wallets
  SET balance = balance + p_amount, updated_at = now()
  WHERE user_id = auth.uid()
  RETURNING balance INTO v_new_balance;
  
  IF v_new_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Wallet not found');
  END IF;
  
  -- Create transaction record
  INSERT INTO transactions (to_user_id, amount, type, status, description, reference)
  VALUES (auth.uid(), p_amount, 'topup', 'completed', 'Wallet top up', p_reference)
  RETURNING id INTO v_transaction_id;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'new_balance', v_new_balance
  );
END;
$$;

-- Secure RPC function: Contribute to money room
CREATE OR REPLACE FUNCTION public.contribute_to_room(
  p_room_id UUID,
  p_amount NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_balance NUMERIC;
  v_room_status room_status;
  v_new_room_amount NUMERIC;
  v_transaction_id UUID;
  v_contribution_id UUID;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;
  
  -- Check user is member of room
  IF NOT EXISTS (
    SELECT 1 FROM room_members 
    WHERE room_id = p_room_id AND user_id = auth.uid()
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Not a member of this room');
  END IF;
  
  -- Check room status
  SELECT status INTO v_room_status
  FROM money_rooms
  WHERE id = p_room_id
  FOR UPDATE;
  
  IF v_room_status IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Room not found');
  END IF;
  
  IF v_room_status != 'active' THEN
    RETURN json_build_object('success', false, 'error', 'Room is not active');
  END IF;
  
  -- Check and lock user balance
  SELECT balance INTO v_user_balance
  FROM wallets
  WHERE user_id = auth.uid()
  FOR UPDATE;
  
  IF v_user_balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  -- Deduct from user wallet
  UPDATE wallets
  SET balance = balance - p_amount, updated_at = now()
  WHERE user_id = auth.uid();
  
  -- Add to room
  UPDATE money_rooms
  SET current_amount = current_amount + p_amount, updated_at = now()
  WHERE id = p_room_id
  RETURNING current_amount INTO v_new_room_amount;
  
  -- Create transaction
  INSERT INTO transactions (from_user_id, room_id, amount, type, status, description)
  VALUES (auth.uid(), p_room_id, p_amount, 'room_contribution', 'completed', 'Room contribution')
  RETURNING id INTO v_transaction_id;
  
  -- Create contribution record
  INSERT INTO room_contributions (room_id, user_id, amount, transaction_id)
  VALUES (p_room_id, auth.uid(), p_amount, v_transaction_id)
  RETURNING id INTO v_contribution_id;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'contribution_id', v_contribution_id,
    'new_room_amount', v_new_room_amount,
    'new_balance', v_user_balance - p_amount
  );
END;
$$;

-- Secure RPC function: Join a room by invite code
CREATE OR REPLACE FUNCTION public.join_room_by_code(
  p_invite_code TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id UUID;
  v_room_status room_status;
BEGIN
  -- Find room by invite code
  SELECT id, status INTO v_room_id, v_room_status
  FROM money_rooms
  WHERE invite_code = p_invite_code;
  
  IF v_room_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid invite code');
  END IF;
  
  IF v_room_status != 'active' THEN
    RETURN json_build_object('success', false, 'error', 'Room is no longer active');
  END IF;
  
  -- Check if already a member
  IF EXISTS (
    SELECT 1 FROM room_members
    WHERE room_id = v_room_id AND user_id = auth.uid()
  ) THEN
    RETURN json_build_object('success', true, 'room_id', v_room_id, 'message', 'Already a member');
  END IF;
  
  -- Add as member
  INSERT INTO room_members (room_id, user_id)
  VALUES (v_room_id, auth.uid());
  
  RETURN json_build_object('success', true, 'room_id', v_room_id);
END;
$$;