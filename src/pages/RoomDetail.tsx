import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Users, Calendar, Target, Unlock, Plus } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function RoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { rooms, contributeToRoom, user, checkRoomUnlocks } = useStore();
  const [amount, setAmount] = useState('');

  const room = rooms.find((r) => r.id === roomId);

  useEffect(() => {
    checkRoomUnlocks();
  }, [checkRoomUnlocks]);

  useEffect(() => {
    if (room?.isUnlocked) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [room?.isUnlocked]);

  if (!room || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Room not found</p>
      </div>
    );
  }

  const progress = room.targetAmount > 0 ? (room.currentAmount / room.targetAmount) * 100 : 0;
  const daysLeft = room.unlockDate
    ? Math.ceil((new Date(room.unlockDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const handleContribute = () => {
    const contributionAmount = parseFloat(amount);

    if (!contributionAmount || contributionAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (contributionAmount > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    contributeToRoom(room.id, contributionAmount);
    toast.success(`Contributed $${contributionAmount} to ${room.name}`);
    setAmount('');
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/rooms')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Rooms
          </Button>

          {/* Room Header */}
          <Card className="p-6 mb-6 gradient-primary text-white border-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">{room.name}</h1>
                {room.isUnlocked ? (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Unlock className="w-5 h-5" />
                    <span className="font-semibold">Unlocked!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">{room.contributors.length}</span>
                  </div>
                )}
              </div>

              <p className="text-white/80 mb-2">Room ID: {room.id}</p>
              <p className="text-white/80">Created by {room.createdBy}</p>
            </div>
          </Card>

          {/* Progress Section */}
          {room.unlockType !== 'date' && (
            <Card className="p-6 mb-6 border-0">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Target Progress</h2>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl font-bold text-primary">
                  ${room.currentAmount.toFixed(2)}
                </span>
                <span className="text-lg text-muted-foreground">
                  of ${room.targetAmount.toFixed(2)}
                </span>
              </div>

              <Progress value={progress} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {progress.toFixed(1)}% complete
              </p>
            </Card>
          )}

          {/* Time Progress */}
          {(room.unlockType === 'date' || room.unlockType === 'both') && room.unlockDate && (
            <Card className="p-6 mb-6 border-0">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-secondary" />
                <h2 className="text-xl font-semibold">Unlock Date</h2>
              </div>

              <p className="text-3xl font-bold mb-2">
                {new Date(room.unlockDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>

              {daysLeft !== null && daysLeft > 0 && (
                <p className="text-muted-foreground">{daysLeft} days remaining</p>
              )}
              {daysLeft !== null && daysLeft <= 0 && (
                <p className="text-destructive">Unlock date has passed!</p>
              )}
            </Card>
          )}

          {/* Contribute Section */}
          {!room.isUnlocked && (
            <Card className="p-6 mb-6 border-0">
              <h2 className="text-xl font-semibold mb-4">Contribute</h2>
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12"
                />
                <Button
                  onClick={handleContribute}
                  className="h-12 gradient-primary border-0"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Funds
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Your balance: ${user.balance.toFixed(2)}
              </p>
            </Card>
          )}

          {/* Contributors */}
          <Card className="p-6 border-0">
            <h2 className="text-xl font-semibold mb-4">Contributors</h2>
            <div className="space-y-3">
              {room.contributors.map((contributor, index) => (
                <motion.div
                  key={contributor.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={contributor.avatar} alt={contributor.name} />
                      <AvatarFallback>{contributor.name[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{contributor.name}</span>
                  </div>
                  <span className="font-semibold text-primary">
                    ${contributor.amount.toFixed(2)}
                  </span>
                </motion.div>
              ))}

              {room.contributors.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No contributions yet. Be the first!
                </p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
