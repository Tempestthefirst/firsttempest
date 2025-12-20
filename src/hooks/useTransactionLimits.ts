import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

interface TransactionLimits {
  dailyLimit: number;
  perTransactionLimit: number;
  minTransaction: number;
}

export function useTransactionLimits() {
  const { profile } = useProfile();
  const [limits, setLimits] = useState<TransactionLimits>({
    dailyLimit: 1000000,
    perTransactionLimit: 500000,
    minTransaction: 100,
  });
  const [loading, setLoading] = useState(true);

  const fetchLimits = useCallback(async () => {
    try {
      const limitName = profile?.is_verified ? 'verified' : 'default';
      
      const { data, error } = await supabase
        .from('transaction_limits')
        .select('daily_limit, per_transaction_limit, min_transaction')
        .eq('name', limitName)
        .maybeSingle();

      if (error) {
        console.error('Error fetching limits:', error);
        return;
      }

      if (data) {
        setLimits({
          dailyLimit: Number(data.daily_limit),
          perTransactionLimit: Number(data.per_transaction_limit),
          minTransaction: Number(data.min_transaction),
        });
      }
    } catch (err) {
      console.error('Error fetching limits:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.is_verified]);

  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  const validateAmount = useCallback(
    (amount: number): { valid: boolean; error?: string } => {
      if (amount < limits.minTransaction) {
        return {
          valid: false,
          error: `Minimum amount is ₦${limits.minTransaction.toLocaleString()}`,
        };
      }
      if (amount > limits.perTransactionLimit) {
        return {
          valid: false,
          error: `Maximum per transaction is ₦${limits.perTransactionLimit.toLocaleString()}`,
        };
      }
      return { valid: true };
    },
    [limits]
  );

  return { limits, loading, validateAmount, refetch: fetchLimits };
}
