import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownLeft, Plus, Users, Receipt, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { BalanceCard } from '@/components/BalanceCard';
import { TransactionCard } from '@/components/TransactionCard';

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
    });
    toast.success(`Received $${amount}`);
  };

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
          className="grid grid-cols-3 gap-3 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card
            className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-card to-card/80"
            onClick={handleSend}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <ArrowUpRight className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium">Send</span>
              </div>
            </motion.div>
          </Card>

          <Card
            className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-card to-card/80"
            onClick={handleReceive}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center">
                  <ArrowDownLeft className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium">Receive</span>
              </div>
            </motion.div>
          </Card>

          <Card
            className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-card to-card/80"
            onClick={handleTopUp}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                  <Plus className="w-6 h-6 text-accent-foreground" />
                </div>
                <span className="text-sm font-medium">Top Up</span>
              </div>
            </motion.div>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
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
              <Card className="p-8 text-center border-0">
                <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start by sending, receiving, or joining a money room
                </p>
              </Card>
            ) : (
              recentTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TransactionCard transaction={transaction} />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-card border-t border-border backdrop-blur-xl bg-card/80"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-around py-4">
            <Button variant="ghost" size="sm" className="flex-col h-auto gap-1">
              <Receipt className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-col h-auto gap-1"
              onClick={() => navigate('/rooms')}
            >
              <Users className="w-5 h-5" />
              <span className="text-xs">Rooms</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-col h-auto gap-1"
              onClick={() => navigate('/transactions')}
            >
              <Receipt className="w-5 h-5" />
              <span className="text-xs">Activity</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-col h-auto gap-1"
              onClick={() => navigate('/profile')}
            >
              <User className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
