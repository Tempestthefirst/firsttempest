import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { hashPin } from '@/lib/crypto';
import { useProfile } from './useProfile';
import { useWallet } from './useWallet';

interface TransferResult {
  success: boolean;
  error?: string;
  transactionId?: string;
  reference?: string;
  newBalance?: number;
}

interface TransferParams {
  toUserId: string;
  amount: number;
  description?: string;
  pin?: string;
}

export function useEnhancedTransfer() {
  const { profile } = useProfile();
  const { refetch: refetchWallet } = useWallet();
  const [isTransferring, setIsTransferring] = useState(false);

  const transfer = useCallback(
    async ({
      toUserId,
      amount,
      description,
      pin,
    }: TransferParams): Promise<TransferResult> => {
      setIsTransferring(true);

      try {
        let pinHash: string | null = null;

        if (pin && profile?.pin_salt) {
          pinHash = await hashPin(pin, profile.pin_salt);
        }

        const { data, error } = await supabase.rpc('transfer_money_v2', {
          p_to_user_id: toUserId,
          p_amount: amount,
          p_description: description || null,
          p_pin_hash: pinHash,
        });

        if (error) {
          console.error('Transfer error:', error);
          return { success: false, error: 'Transfer failed' };
        }

        const result = data as unknown as TransferResult;

        if (result.success) {
          await refetchWallet();
        }

        return result;
      } catch (err) {
        console.error('Transfer error:', err);
        return { success: false, error: 'Transfer failed' };
      } finally {
        setIsTransferring(false);
      }
    },
    [profile?.pin_salt, refetchWallet]
  );

  return { transfer, isTransferring };
}
