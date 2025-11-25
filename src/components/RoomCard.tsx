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
      className="p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-0 relative overflow-hidden bg-gradient-to-br from-card to-card/50 shadow-sm"
      onClick={onClick}
    >
      {/* Background gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

      <motion.div 
        whileHover={{ y: -4 }} 
        whileTap={{ scale: 0.98 }}
        className="relative z-10"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold">{room.name}</h3>
              {room.isUnlocked && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 font-semibold">
                  <Unlock className="w-3 h-3 mr-1" />
                  Unlocked
                </Badge>
              )}
              {!room.isUnlocked && (
                <Badge variant="secondary" className="bg-primary/10 text-primary font-semibold">
                  <Lock className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-medium">#{room.id.slice(0, 8)}</p>
          </div>
        </div>

        {room.unlockType !== 'date' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground flex items-center gap-1 font-medium">
                <Target className="w-4 h-4" />
                Goal Progress
              </span>
              <span className="text-sm font-bold">
                ${room.currentAmount.toFixed(2)} / ${room.targetAmount.toFixed(2)}
              </span>
            </div>
            <Progress value={progress} className="h-3 mb-4 bg-muted" />
            <p className="text-xs text-muted-foreground text-right font-semibold">{Math.round(progress)}% Complete</p>
          </>
        )}

        <div className="flex items-center justify-between text-sm mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-1 text-muted-foreground font-medium">
            <Users className="w-4 h-4" />
            <span>{room.contributors.length} contributors</span>
          </div>
          {isDateBased && daysLeft !== null && (
            <div className="flex items-center gap-1 text-muted-foreground font-medium">
              <Calendar className="w-4 h-4" />
              <span>
                {daysLeft > 0 ? `${daysLeft}d left` : 'Unlocking'}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </Card>
  );
};
