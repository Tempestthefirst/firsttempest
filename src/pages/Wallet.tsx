import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function Wallet() {
  const { user, updateBalance, addTransaction } = useStore();

  if (!user) return null;

  const handleTopUp = () => {
    const amount = 500;
    updateBalance(amount);
    addTransaction({
      type: 'topup',
      amount,
      description: 'Wallet top-up',
      status: 'confirmed',
    });
    toast.success(`Added $${amount} to your wallet`);
  };

  const handleSend = () => {
    toast.info('Send money feature - coming soon');
  };

  const handleReceive = () => {
    toast.info('Receive money feature - coming soon');
  };

  const walletActions = [
    { icon: ArrowUpRight, label: 'Send', color: 'text-red-600', bgColor: 'bg-red-50', action: handleSend },
    { icon: ArrowDownLeft, label: 'Receive', color: 'text-green-600', bgColor: 'bg-green-50', action: handleReceive },
    { icon: Plus, label: 'Top Up', color: 'text-primary', bgColor: 'bg-primary/10', action: handleTopUp },
    { icon: CreditCard, label: 'Cards', color: 'text-secondary', bgColor: 'bg-secondary/10', action: () => toast.info('Cards - coming soon') },
  ];

  return (
    <div className="min-h-screen pb-20 bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <BackButton to="/" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
              <WalletIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Wallet</h1>
              <p className="text-muted-foreground">Manage your funds</p>
            </div>
          </div>

          {/* Balance Card */}
          <Card className="p-8 mb-6 gradient-primary text-white relative overflow-hidden border-0">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <p className="text-white/80 text-sm mb-2">Available Balance</p>
              <p className="text-5xl font-bold mb-4">${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              <p className="text-white/70 text-sm">Wallet ID: {user.id}</p>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {walletActions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.action}
                className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-full ${action.bgColor} flex items-center justify-center`}>
                  <action.icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <span className="text-xs font-medium">{action.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Wallet Info */}
          <Card className="p-6 border-0">
            <h2 className="text-xl font-semibold mb-4">Wallet Details</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Account Status</span>
                <span className="font-semibold text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Wallet Type</span>
                <span className="font-semibold">Personal</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Currency</span>
                <span className="font-semibold">USD</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
