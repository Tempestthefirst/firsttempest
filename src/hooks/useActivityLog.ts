import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type ActivityAction = 
  | 'login'
  | 'logout'
  | 'transfer_sent'
  | 'transfer_received'
  | 'topup'
  | 'pin_verified'
  | 'pin_failed'
  | 'pin_changed'
  | 'profile_updated'
  | 'room_joined'
  | 'room_created'
  | 'room_contribution';

interface LogActivityParams {
  action: ActivityAction;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

export function useActivityLog() {
  const logActivity = useCallback(async ({
    action,
    resourceType,
    resourceId,
    metadata = {},
  }: LogActivityParams) => {
    try {
      const { data, error } = await supabase.rpc('log_activity', {
        p_action: action,
        p_resource_type: resourceType || null,
        p_resource_id: resourceId || null,
        p_metadata: JSON.parse(JSON.stringify(metadata)),
      });

      if (error) {
        console.error('Error logging activity:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error logging activity:', err);
      return null;
    }
  }, []);

  return { logActivity };
}
