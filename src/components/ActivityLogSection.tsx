import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  LogIn, 
  Send, 
  Key, 
  UserCog, 
  AlertCircle,
  Loader2,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityLog {
  id: string;
  action: string;
  resource_type: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

const actionIcons: Record<string, typeof Shield> = {
  login: LogIn,
  transfer_sent: Send,
  pin_verified: Key,
  pin_failed: AlertCircle,
  pin_changed: Key,
  profile_updated: UserCog,
};

const actionLabels: Record<string, string> = {
  login: 'Logged in',
  transfer_sent: 'Money sent',
  pin_verified: 'PIN verified',
  pin_failed: 'Failed PIN attempt',
  pin_changed: 'PIN changed',
  profile_updated: 'Profile updated',
};

export function ActivityLogSection() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching activity logs:', error);
      } else {
        setLogs((data as ActivityLog[]) || []);
      }
      setLoading(false);
    };

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <Card className="p-6 border-0 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-0 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold">Activity Log</h2>
      </div>
      
      {logs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No recent activity</p>
        </div>
      ) : (
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {logs.map((log, index) => {
              const Icon = actionIcons[log.action] || Shield;
              const label = actionLabels[log.action] || log.action;
              const isFailure = log.action.includes('fail');
              
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-muted/50"
                >
                  <div className={`p-2 rounded-lg ${isFailure ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                    <Icon className={`w-4 h-4 ${isFailure ? 'text-destructive' : 'text-primary'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{label}</p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <p className="text-xs text-muted-foreground truncate">
                        {JSON.stringify(log.metadata)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
