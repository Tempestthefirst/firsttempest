import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Send, ArrowDownToLine, Plus, Wallet, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BalanceCard } from '@/components/BalanceCard';
import { TransactionCard } from '@/components/TransactionCard';
import { BottomNav } from '@/components/BottomNav';
import { TransactionSkeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { user, transactions } = useStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!user) return null;

  const recentTransactions = transactions.slice(0, 5);

  const quickActions = [
    { icon: Send, label: 'Send', color: 'from-purple-500 to-purple-600', action: () => navigate('/send') },
    { icon: ArrowDownToLine, label: 'Request', color: 'from-blue-500 to-blue-600', action: () => navigate('/receive') },
    { icon: Plus, label: 'Add Cash', color: 'from-green-500 to-green-600', action: () => navigate('/topup') },
    { icon: Wallet, label: 'Wallet', color: 'from-amber-500 to-amber-600', action: () => navigate('/wallet') },
  ];

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Balance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BalanceCard balance={user.balance} />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="grid grid-cols-4 gap-4 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, type: 'spring' }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.action}
              className={`flex flex-col items-center gap-3 p-5 bg-gradient-to-br ${action.color} rounded-3xl shadow-banking hover:shadow-banking-lg transition-all text-white`}
            >
              <action.icon className="w-7 h-7" strokeWidth={2.5} />
              <span className="text-sm font-semibold text-center">{action.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Transaction History */}
        <Card className="p-6 mt-8 border-0 shadow-banking-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Activity</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/transactions')}
              className="text-primary font-semibold"
            >
              See All
            </Button>
          </div>

          <div className="space-y-2">
            {isLoading ? (
              <>
                <TransactionSkeleton />
                <TransactionSkeleton />
                <TransactionSkeleton />
              </>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your activity will appear here
                </p>
              </div>
            ) : (
              recentTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TransactionCard transaction={transaction} />
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Floating Action Button - Create Money Room */}
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        onClick={() => navigate('/rooms')}
        className="fixed bottom-24 right-6 z-40 w-16 h-16 rounded-full gradient-primary shadow-2xl flex items-center justify-center text-white"
        aria-label="Create Money Room"
      >
        <Plus className="w-8 h-8" strokeWidth={3} />
      </motion.button>

      <BottomNav />
    </div>
  );
}
