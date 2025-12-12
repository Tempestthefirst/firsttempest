import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface BalanceCardProps {
  balance: number;
}

export const BalanceCard = ({ balance }: BalanceCardProps) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <Card 
      className="p-8 gradient-primary border-0 text-white relative overflow-hidden shadow-lg"
      role="region"
      aria-label="Account balance"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" aria-hidden="true" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <span className="text-white/90 text-sm font-semibold uppercase tracking-wide">Available Balance</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsVisible(!isVisible)}
            className="text-white/90 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label={isVisible ? 'Hide balance' : 'Show balance'}
            aria-pressed={isVisible}
          >
            {isVisible ? <Eye className="w-5 h-5" aria-hidden="true" /> : <EyeOff className="w-5 h-5" aria-hidden="true" />}
          </motion.button>
        </div>

        <motion.div
          key={balance}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
          aria-live="polite"
        >
          {isVisible ? (
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-medium">₦</span>
              <span className="text-6xl font-bold tracking-tight">
                {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ) : (
            <span className="text-6xl font-bold" aria-label="Balance hidden">••••••</span>
          )}
        </motion.div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-hidden="true" />
          <p className="text-white/80 text-sm font-medium">Available for spending and rooms</p>
        </div>
      </div>
    </Card>
  );
};