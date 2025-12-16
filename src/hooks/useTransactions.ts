import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Transaction = Tables<'transactions'>;

interface UseTransactionsResult {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTransactions(): UseTransactionsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTransactions([]);
        return;
      }

      const { data, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (txError) {
        console.error('Error fetching transactions:', txError);
        setError(txError.message);
        return;
      }

      setTransactions(data || []);
    } catch (err) {
      console.error('Error in useTransactions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchTransactions();
    });

    return () => subscription.unsubscribe();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
  };
}
