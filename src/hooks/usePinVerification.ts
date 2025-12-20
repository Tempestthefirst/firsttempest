import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { hashPin } from '@/lib/crypto';
import { useProfile } from './useProfile';

interface PinVerificationResult {
  success: boolean;
  error?: string;
  locked?: boolean;
  attemptsRemaining?: number;
  lockedUntil?: string;
  minutesRemaining?: number;
}

export function usePinVerification() {
  const { profile } = useProfile();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockExpiresAt, setLockExpiresAt] = useState<Date | null>(null);

  const verifyPin = useCallback(
    async (pin: string): Promise<PinVerificationResult> => {
      if (!profile?.pin_salt) {
        return { success: false, error: 'PIN not set up' };
      }

      setIsVerifying(true);
      try {
        const pinHash = await hashPin(pin, profile.pin_salt);

        const { data, error } = await supabase.rpc('verify_pin_with_limit', {
          p_pin_hash: pinHash,
        });

        if (error) {
          console.error('PIN verification error:', error);
          return { success: false, error: 'Verification failed' };
        }

        const result = data as unknown as PinVerificationResult;

        if (result.locked) {
          setIsLocked(true);
          if (result.lockedUntil) {
            setLockExpiresAt(new Date(result.lockedUntil));
          }
        } else if (result.success) {
          setIsLocked(false);
          setLockExpiresAt(null);
        }

        return result;
      } catch (err) {
        console.error('PIN verification error:', err);
        return { success: false, error: 'Verification failed' };
      } finally {
        setIsVerifying(false);
      }
    },
    [profile?.pin_salt]
  );

  const getRemainingLockTime = useCallback((): number => {
    if (!lockExpiresAt) return 0;
    const remaining = lockExpiresAt.getTime() - Date.now();
    return Math.max(0, Math.ceil(remaining / 60000)); // minutes
  }, [lockExpiresAt]);

  return {
    verifyPin,
    isVerifying,
    isLocked,
    lockExpiresAt,
    getRemainingLockTime,
  };
}
