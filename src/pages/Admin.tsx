import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Unlock, RefreshCw, Database } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function Admin() {
  const { rooms, unlockRoom, refundRoom, checkRoomUnlocks } = useStore();

  const handleTriggerUnlock = (roomId: string) => {
    unlockRoom(roomId);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    toast.success('Room manually unlocked!');
  };

  const handleRefund = (roomId: string) => {
    refundRoom(roomId);
    toast.success('All contributions refunded');
  };

  const handleCheckUnlocks = () => {
    checkRoomUnlocks();
    toast.info('Checked all rooms for unlock conditions');
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <BackButton to="/profile" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground">Manual controls for demo mode</p>
            </div>
          </div>

          <Card className="p-6 mb-6 border-0 bg-red-50 dark:bg-red-950/20">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100">
                  Admin Access
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  This panel provides manual controls for testing. In production, these
                  actions would require proper authentication and authorization.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-6 border-0">
            <h2 className="text-lg font-semibold mb-4">System Actions</h2>
            <Button
              onClick={handleCheckUnlocks}
              className="w-full sm:w-auto gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Check All Rooms for Unlock
            </Button>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Money Rooms</h2>
            {rooms.map((room) => (
              <Card key={room.id} className="p-6 border-0">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{room.name}</h3>
                      <Badge variant={room.status === 'open' ? 'default' : 'secondary'}>
                        {room.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">ID: {room.id}</p>
                    <p className="text-sm text-muted-foreground">
                      Invite Code: {room.inviteCode}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Amount</p>
                    <p className="text-lg font-semibold">
                      ₦{room.currentAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Amount</p>
                    <p className="text-lg font-semibold">
                      ₦{room.targetAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contributors</p>
                    <p className="text-lg font-semibold">{room.contributors.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unlock Type</p>
                    <p className="text-lg font-semibold capitalize">{room.unlockType}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Contributions:</p>
                  <div className="space-y-1 text-sm">
                    {room.contributions && room.contributions.length > 0 ? (
                      room.contributions.map((contrib) => (
                        <div
                          key={contrib.id}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded"
                        >
                          <span>User: {contrib.userId}</span>
                          <span className="font-medium">₦{contrib.amount}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No contributions yet</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="default"
                    onClick={() => handleTriggerUnlock(room.id)}
                    disabled={room.status !== 'open'}
                    className="flex-1 gap-2"
                  >
                    <Unlock className="w-4 h-4" />
                    Trigger Unlock
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleRefund(room.id)}
                    disabled={room.status !== 'open'}
                    className="flex-1 gap-2"
                  >
                    <Database className="w-4 h-4" />
                    Force Refund
                  </Button>
                </div>

                {room.status !== 'open' && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Room is {room.status} - no actions available
                  </p>
                )}
              </Card>
            ))}

            {rooms.length === 0 && (
              <Card className="p-12 text-center border-0">
                <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No rooms yet</h3>
                <p className="text-muted-foreground">
                  Create some rooms or load demo data to see them here
                </p>
              </Card>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
