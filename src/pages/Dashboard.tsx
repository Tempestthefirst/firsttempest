import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import { useTransactions } from '@/hooks/useTransactions';
import { useProfile } from '@/hooks/useProfile';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Send, 
  ArrowDownToLine, 
  Plus,
  Receipt,
  Eye,
  EyeOff,
  CreditCard,
  Building2,
  Copy,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { TransactionCard } from '@/components/TransactionCard';
import { BottomNav } from '@/components/BottomNav';
import { TransactionSkeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function Dashboard() {
  const { wallet, loading: walletLoading, topUp, refetch: refetchWallet } = useWallet();
  const { transactions, loading: txLoading } = useTransactions();
  const { profile } = useProfile();
  const { isEnabled } = useFeatureFlags();
  const isDemoMode = isEnabled('demo_mode');
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [addMoneyTab, setAddMoneyTab] = useState<'card' | 'transfer'>('card');
  
  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardLoading, setCardLoading] = useState(false);
  const [cardAmount, setCardAmount] = useState('');
  
  // Transfer state
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');

  const isLoading = walletLoading || txLoading;

  // Transform DB transactions to match TransactionCard format
  const recentTransactions = transactions.slice(0, 5).map(tx => ({
    id: tx.id,
    type: tx.type as 'send' | 'receive' | 'topup' | 'room-contribution' | 'room-unlock' | 'transfer' | 'settlement' | 'hourglass-deduction',
    amount: tx.type === 'send' || tx.type === 'transfer' || tx.type === 'room_contribution' 
      ? -Number(tx.amount) 
      : Number(tx.amount),
    description: tx.description || tx.type,
    date: new Date(tx.created_at),
    status: tx.status as 'pending' | 'confirmed' | 'refunded',
  }));

  const quickActions = [
    { icon: Send, label: 'Send', action: () => navigate('/send') },
    { icon: ArrowDownToLine, label: 'Receive', action: () => navigate('/receive') },
    { icon: Plus, label: 'Add Money', action: () => setIsAddMoneyOpen(true) },
  ];

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(cardAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (!cardNumber || cardNumber.length < 16) {
      toast.error('Enter a valid card number');
      return;
    }
    if (!expiry) {
      toast.error('Enter card expiry');
      return;
    }
    if (!cvv || cvv.length < 3) {
      toast.error('Enter CVV');
      return;
    }

    setCardLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = await topUp(amount);
    setCardLoading(false);
    
    if (result.success) {
      setIsAddMoneyOpen(false);
      setCardNumber('');
      setExpiry('');
      setCvv('');
      setCardName('');
      setCardAmount('');
      toast.success(`₦${amount.toLocaleString()} added successfully!`);
    } else {
      toast.error(result.error || 'Failed to add money');
    }
  };

  const handleTransferConfirm = async () => {
    const amount = parseFloat(transferAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    setTransferLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const result = await topUp(amount);
    setTransferLoading(false);
    
    if (result.success) {
      setIsAddMoneyOpen(false);
      setTransferAmount('');
      toast.success(`₦${amount.toLocaleString()} received!`);
    } else {
      toast.error(result.error || 'Failed to confirm transfer');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <Header />

      <div className="max-w-lg mx-auto px-4 pt-20">
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl"
          >
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              <strong>Demo Mode</strong> — Using simulated money for testing
            </p>
          </motion.div>
        )}

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card 
            className="p-6 border-0 bg-foreground text-background rounded-3xl shadow-banking-lg"
            role="region"
            aria-label="Account balance"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm opacity-70">Available Balance</p>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 rounded-full hover:bg-background/10 transition-colors"
                aria-label={showBalance ? 'Hide balance' : 'Show balance'}
              >
                {showBalance ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>
            <motion.p 
              className="text-4xl font-bold tracking-tight"
              key={showBalance ? 'shown' : 'hidden'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {showBalance ? `₦${(wallet?.balance || 0).toLocaleString()}` : '₦••••••'}
            </motion.p>
            {wallet?.pendingBalance && wallet.pendingBalance > 0 ? (
              <p className="text-sm opacity-70 mt-1">
                {showBalance ? `₦${wallet.pendingBalance.toLocaleString()} pending` : '••• pending'}
              </p>
            ) : null}
            <p className="text-sm opacity-50 mt-2">{profile?.full_name || 'Loading...'}</p>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="mt-6 overflow-x-auto scrollbar-hide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex gap-3 min-w-max px-1 pb-2">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, type: 'spring' }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.action}
                className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-2xl min-w-[72px] shadow-banking hover:shadow-banking-lg transition-all focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={action.label}
              >
                <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
                  <action.icon className="w-5 h-5 text-foreground" strokeWidth={2} />
                </div>
                <span className="text-xs font-medium text-foreground">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recent Activity</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/transactions')}
              className="text-sm font-medium hover:bg-transparent hover:text-foreground/70"
              aria-label="See all transactions"
            >
              See All
            </Button>
          </div>

          <Card className="border-0 shadow-banking-lg overflow-hidden">
            <div className="divide-y divide-border">
              {isLoading ? (
                <>
                  <TransactionSkeleton />
                  <TransactionSkeleton />
                  <TransactionSkeleton />
                </>
              ) : recentTransactions.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">No transactions yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your activity will appear here
                  </p>
                </div>
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
          </Card>
        </motion.div>
      </div>

      {/* Add Money Dialog */}
      <Dialog open={isAddMoneyOpen} onOpenChange={setIsAddMoneyOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl">Add Money</DialogTitle>
          </DialogHeader>
          
          <Tabs value={addMoneyTab} onValueChange={(v) => setAddMoneyTab(v as 'card' | 'transfer')} className="w-full">
            <TabsList className="w-full grid grid-cols-2 mx-6 mb-4" style={{ width: 'calc(100% - 48px)' }}>
              <TabsTrigger value="card" className="data-[state=active]:bg-foreground data-[state=active]:text-background">
                <CreditCard className="w-4 h-4 mr-2" />
                By Card
              </TabsTrigger>
              <TabsTrigger value="transfer" className="data-[state=active]:bg-foreground data-[state=active]:text-background">
                <Building2 className="w-4 h-4 mr-2" />
                By Transfer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="card" className="px-6 pb-6 mt-0">
              <form onSubmit={handleCardPayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardAmount">Amount (₦)</Label>
                  <Input
                    id="cardAmount"
                    type="number"
                    placeholder="0"
                    value={cardAmount}
                    onChange={(e) => setCardAmount(e.target.value)}
                    className="h-12 text-lg"
                    inputMode="numeric"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="h-12"
                    inputMode="numeric"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                      className="h-12"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      type="password"
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      maxLength={4}
                      className="h-12"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="Name on card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="h-12"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-success hover:bg-success/90 text-white font-semibold"
                  disabled={cardLoading}
                >
                  {cardLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Pay Now'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="transfer" className="px-6 pb-6 mt-0">
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Bank</span>
                    <span className="font-medium">{wallet?.virtual_account_bank || 'FirstPay'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Account Name</span>
                    <span className="font-medium">{profile?.full_name || 'Loading...'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Account Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg">
                        {wallet?.virtual_account_number || '0012345678'}
                      </span>
                      <button
                        onClick={() => copyToClipboard(wallet?.virtual_account_number || '0012345678', 'Account number')}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        aria-label="Copy account number"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-xl">
                  <p className="text-sm text-muted-foreground mb-3">
                    Transfer to this account from any bank app. Your balance will be updated automatically.
                  </p>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-success">1.</span>
                      <span>Open your bank app</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">2.</span>
                      <span>Transfer to the account above</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">3.</span>
                      <span>Enter amount and confirm below</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transferAmount">Amount Transferred (₦)</Label>
                  <Input
                    id="transferAmount"
                    type="number"
                    placeholder="0"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="h-12 text-lg"
                    inputMode="numeric"
                  />
                </div>

                <Button
                  onClick={handleTransferConfirm}
                  className="w-full h-12 bg-success hover:bg-success/90 text-white font-semibold"
                  disabled={transferLoading}
                >
                  {transferLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      I've Paid
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
