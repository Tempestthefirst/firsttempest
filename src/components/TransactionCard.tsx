import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Transaction } from '@/store/useStore';
import { ArrowUpRight, ArrowDownLeft, Plus, Users, Unlock } from 'lucide-react';

interface TransactionCardProps {
  transaction: Transaction;
}

export const TransactionCard = ({ transaction }: TransactionCardProps) => {
  const getIcon = () => {
    switch (transaction.type) {
      case 'send':
        return <ArrowUpRight className="w-5 h-5" />;
      case 'receive':
        return <ArrowDownLeft className="w-5 h-5" />;
      case 'topup':
        return <Plus className="w-5 h-5" />;
      case 'room-contribution':
        return <Users className="w-5 h-5" />;
      case 'room-unlock':
        return <Unlock className="w-5 h-5" />;
    }
  };

  const getColorClass = () => {
    if (transaction.amount > 0) return 'text-green-600';
    return 'text-red-600';
  };

  const getBgClass = () => {
    switch (transaction.type) {
      case 'send':
        return 'bg-red-100 text-red-600';
      case 'receive':
        return 'bg-green-100 text-green-600';
      case 'topup':
        return 'bg-blue-100 text-blue-600';
      case 'room-contribution':
        return 'bg-purple-100 text-purple-600';
      case 'room-unlock':
        return 'bg-yellow-100 text-yellow-600';
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer border-0">
      <motion.div whileHover={{ x: 4 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getBgClass()}`}>
            {getIcon()}
          </div>
          <div>
            <p className="font-medium">{transaction.description}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(transaction.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <span className={`font-semibold ${getColorClass()}`}>
          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
        </span>
      </motion.div>
    </Card>
  );
};
