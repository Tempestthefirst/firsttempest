import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownLeft, Plus, Users, Unlock, Hourglass, RefreshCw } from 'lucide-react';

interface TransactionData {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: Date;
  status?: string;
}

interface TransactionCardProps {
  transaction: TransactionData;
}

export const TransactionCard = ({ transaction }: TransactionCardProps) => {
  // Normalize type (handle both dash and underscore formats)
  const normalizedType = transaction.type.replace(/_/g, '-');
  
  const getIcon = () => {
    switch (normalizedType) {
      case 'send':
      case 'transfer':
        return <ArrowUpRight className="w-5 h-5" strokeWidth={2.5} />;
      case 'receive':
        return <ArrowDownLeft className="w-5 h-5" strokeWidth={2.5} />;
      case 'topup':
        return <Plus className="w-5 h-5" strokeWidth={2.5} />;
      case 'room-contribution':
        return <Users className="w-5 h-5" strokeWidth={2.5} />;
      case 'room-unlock':
      case 'room-refund':
        return <Unlock className="w-5 h-5" strokeWidth={2.5} />;
      case 'hourglass-deduction':
        return <Hourglass className="w-5 h-5" strokeWidth={2.5} />;
      default:
        return <RefreshCw className="w-5 h-5" strokeWidth={2.5} />;
    }
  };

  const getColorClass = () => {
    if (transaction.amount > 0) return 'text-green-600 font-bold';
    return 'text-red-600 font-bold';
  };

  const getBgClass = () => {
    switch (normalizedType) {
      case 'send':
      case 'transfer':
        return 'bg-red-50 text-red-600';
      case 'receive':
        return 'bg-green-50 text-green-600';
      case 'topup':
        return 'bg-blue-50 text-blue-600';
      case 'room-contribution':
        return 'bg-purple-50 text-purple-600';
      case 'room-unlock':
      case 'room-refund':
        return 'bg-yellow-50 text-yellow-600';
      case 'hourglass-deduction':
        return 'bg-orange-50 text-orange-600';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-card shadow-sm">
      <motion.div 
        whileHover={{ x: 4 }} 
        whileTap={{ scale: 0.98 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getBgClass()}`}>
            {getIcon()}
          </div>
          <div>
            <p className="font-bold text-base">{transaction.description}</p>
            <p className="text-sm text-muted-foreground font-medium">
              {new Date(transaction.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <span className={`font-bold text-lg ${getColorClass()}`}>
          {transaction.amount > 0 ? '+' : ''}₦{Math.abs(transaction.amount).toLocaleString()}
        </span>
      </motion.div>
    </Card>
  );
};
