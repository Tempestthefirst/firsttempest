import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Wallet {
  id: string;
  balance: number;
  currency: string;
  virtual_account_number: string | null;
  virtual_account_bank: string | null;
}

interface UseWalletResult {
  wallet: Wallet | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  topUp: (amount: number, reference?: string) => Promise<{ success: boolean; error?: string; newBalance?: number }>;
  transfer: (toUserId: string, amount: number, description?: string) => Promise<{ success: boolean; error?: string; newBalance?: number }>;
}

export function useWallet(): UseWalletResult {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('get_my_wallet');

      if (rpcError) {
        console.error('Error fetching wallet:', rpcError);
        setError(rpcError.message);
        return;
      }

      if (data && data.length > 0) {
        setWallet({
          id: data[0].id,
          balance: Number(data[0].balance),
          currency: data[0].currency,
          virtual_account_number: data[0].virtual_account_number,
          virtual_account_bank: data[0].virtual_account_bank,
        });
      }
    } catch (err) {
      console.error('Error in useWallet:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchWallet();
    });

    return () => subscription.unsubscribe();
  }, [fetchWallet]);

  const topUp = useCallback(async (amount: number, reference?: string) => {
    try {
      const { data, error: rpcError } = await supabase.rpc('topup_wallet', {
        p_amount: amount,
        p_reference: reference || null,
      });

      if (rpcError) {
        return { success: false, error: rpcError.message };
      }

      const result = data as { success: boolean; error?: string; new_balance?: number };
      
      if (result.success && result.new_balance !== undefined) {
        setWallet(prev => prev ? { ...prev, balance: result.new_balance! } : null);
        return { success: true, newBalance: result.new_balance };
      }

      return { success: false, error: result.error || 'Unknown error' };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);

  const transfer = useCallback(async (toUserId: string, amount: number, description?: string) => {
    try {
      const { data, error: rpcError } = await supabase.rpc('transfer_money', {
        p_to_user_id: toUserId,
        p_amount: amount,
        p_description: description || null,
      });

      if (rpcError) {
        return { success: false, error: rpcError.message };
      }

      const result = data as { success: boolean; error?: string; new_balance?: number };
      
      if (result.success && result.new_balance !== undefined) {
        setWallet(prev => prev ? { ...prev, balance: result.new_balance! } : null);
        return { success: true, newBalance: result.new_balance };
      }

      return { success: false, error: result.error || 'Unknown error' };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);

  return {
    wallet,
    loading,
    error,
    refetch: fetchWallet,
    topUp,
    transfer,
  };
}
