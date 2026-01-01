import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

import { Json } from '@/integrations/supabase/types';

interface FeatureFlag {
  name: string;
  enabled: boolean;
  metadata?: Json;
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [metadata, setMetadata] = useState<Record<string, Json>>({});
  const [loading, setLoading] = useState(true);

  const fetchFlags = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('name, enabled, metadata');

      if (error) {
        console.error('Error fetching feature flags:', error);
        return;
      }

      if (data) {
        const flagMap: Record<string, boolean> = {};
        const metaMap: Record<string, Json> = {};
        data.forEach((flag) => {
          flagMap[flag.name] = flag.enabled ?? false;
          if (flag.metadata) {
            metaMap[flag.name] = flag.metadata;
          }
        });
        setFlags(flagMap);
        setMetadata(metaMap);
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
    (featureName: string): boolean => {
      return flags[featureName] ?? false;
    },
    [flags]
  );

  const getMetadata = useCallback(
    (featureName: string): Json | undefined => {
      return metadata[featureName];
    },
    [metadata]
  );

  return { flags, loading, isEnabled, getMetadata, refetch: fetchFlags };
}
