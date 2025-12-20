import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FeatureFlags {
  hourglass: boolean;
  money_rooms: boolean;
  card_payments: boolean;
  bank_transfers: boolean;
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>({
    hourglass: true,
    money_rooms: true,
    card_payments: true,
    bank_transfers: true,
  });
  const [loading, setLoading] = useState(true);

  const fetchFlags = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('name, enabled');

      if (error) {
        console.error('Error fetching feature flags:', error);
        return;
      }

      if (data) {
        const flagMap: Partial<FeatureFlags> = {};
        data.forEach((flag) => {
          if (flag.name in flags) {
            flagMap[flag.name as keyof FeatureFlags] = flag.enabled;
          }
        });
        setFlags((prev) => ({ ...prev, ...flagMap }));
      }
    } catch (err) {
      console.error('Error fetching feature flags:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const isEnabled = useCallback(
    (featureName: keyof FeatureFlags): boolean => {
      return flags[featureName] ?? false;
    },
    [flags]
  );

  return { flags, loading, isEnabled, refetch: fetchFlags };
}
