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
    <Card className="p-6 gradient-primary border-0 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white/80 text-sm font-medium">Total Balance</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsVisible(!isVisible)}
            className="text-white/80 hover:text-white transition-colors"
          >
            {isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </motion.button>
        </div>

        <motion.div
          key={balance}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold mb-2"
        >
          {isVisible ? (
            <span>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          ) : (
            <span>••••••</span>
          )}
        </motion.div>

        <p className="text-white/70 text-sm">Available for spending and rooms</p>
      </div>
    </Card>
  );
};
