import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownLeft, Plus, Wallet, Receipt, Zap, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { BalanceCard } from '@/components/BalanceCard';
import { TransactionCard } from '@/components/TransactionCard';
import { BottomNav } from '@/components/BottomNav';

export default function Dashboard() {
  const { user, transactions, updateBalance, addTransaction } = useStore();
  const navigate = useNavigate();

  if (!user) return null;

  const recentTransactions = transactions.slice(0, 5);

  const handleTopUp = () => {
    const amount = 500;
    updateBalance(amount);
    addTransaction({
      type: 'topup',
      amount,
      description: 'Account top-up',
      status: 'confirmed',
    });
    toast.success(`Added $${amount} to your balance`);
  };

  const handleSend = () => {
    // Mock send functionality
    const amount = 50;
    if (user.balance < amount) {
      toast.error('Insufficient balance');
      return;
    }
    updateBalance(-amount);
    addTransaction({
      type: 'send',
      amount: -amount,
      description: 'Sent to friend',
      status: 'confirmed',
    });
    toast.success(`Sent $${amount}`);
  };

  const handleReceive = () => {
    // Mock receive functionality
    const amount = 75;
    updateBalance(amount);
    addTransaction({
      type: 'receive',
      amount,
      description: 'Received from friend',
      status: 'confirmed',
    });
    toast.success(`Received $${amount}`);
  };

  const quickActions = [
    { icon: ArrowUpRight, label: 'Send Money', color: 'text-primary', bgColor: 'bg-primary/10', action: handleSend },
    { icon: ArrowDownLeft, label: 'Receive', color: 'text-secondary', bgColor: 'bg-secondary/10', action: handleReceive },
    { icon: Plus, label: 'Top Up', color: 'text-accent', bgColor: 'bg-accent/10', action: handleTopUp },
    { icon: Zap, label: 'Bills', color: 'text-orange-600', bgColor: 'bg-orange-50', action: () => toast.info('Bills coming soon!') },
    { icon: CreditCard, label: 'Cards', color: 'text-pink-600', bgColor: 'bg-pink-50', action: () => toast.info('Cards coming soon!') },
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
          className="grid grid-cols-5 gap-3 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.action}
              className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-full ${action.bgColor} flex items-center justify-center`}>
                <action.icon className={`w-6 h-6 ${action.color}`} />
              </div>
              <span className="text-xs font-medium text-center">{action.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Transaction History */}
        <Card className="p-6 mt-8 border-0 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Transaction History</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/transactions')}
              className="text-primary"
            >
              View All
            </Button>
          </div>

          <div className="space-y-2">
            {recentTransactions.length === 0 ? (
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
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/rooms')}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full gradient-primary shadow-lg flex items-center justify-center text-white"
        aria-label="Create Money Room"
      >
        <Wallet className="w-6 h-6" />
      </motion.button>

      <BottomNav />
    </div>
  );
}
