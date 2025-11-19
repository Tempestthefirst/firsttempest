import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { MoneyRoom } from '@/store/useStore';
import { Progress } from '@/components/ui/progress';
import { Calendar, Target, Users, Lock, Unlock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RoomCardProps {
  room: MoneyRoom;
  onClick: () => void;
}

export const RoomCard = ({ room, onClick }: RoomCardProps) => {
  const progress = room.targetAmount > 0 ? (room.currentAmount / room.targetAmount) * 100 : 0;
  const isDateBased = room.unlockType === 'date' || room.unlockType === 'both';
  const daysLeft = room.unlockDate
    ? Math.ceil((new Date(room.unlockDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card
      className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-0 relative overflow-hidden"
      onClick={onClick}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />

      <motion.div whileHover={{ scale: 1.02 }} className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold">{room.name}</h3>
              {room.isUnlocked && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <Unlock className="w-3 h-3 mr-1" />
                  Unlocked
                </Badge>
              )}
              {!room.isUnlocked && (
                <Badge variant="secondary">
                  <Lock className="w-3 h-3 mr-1" />
                  Locked
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">ID: {room.id}</p>
          </div>
        </div>

        {room.unlockType !== 'date' && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Target className="w-4 h-4" />
                Progress
              </span>
              <span className="text-sm font-medium">
                ${room.currentAmount.toFixed(2)} / ${room.targetAmount.toFixed(2)}
              </span>
            </div>
            <Progress value={progress} className="h-2 mb-4" />
          </>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{room.contributors.length} contributors</span>
          </div>
          {isDateBased && daysLeft !== null && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {daysLeft > 0 ? `${daysLeft} days left` : 'Unlock date passed'}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </Card>
  );
};
