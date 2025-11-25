import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2, CreditCard, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

export default function TopUp() {
  const navigate = useNavigate();
  const { user, topUp } = useStore();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');

  if (!user) return null;

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      await topUp(amountNum);
      toast.success(`₦${amountNum.toLocaleString()} added to your wallet!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Top-up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <Header />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <BackButton to="/dashboard" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Plus className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Add Cash</h1>
              <p className="text-muted-foreground">Top up your wallet balance</p>
            </div>
          </div>

          <Card className="p-6 border-0 shadow-banking-lg mb-6">
            <form onSubmit={handleTopUp} className="space-y-6">
              <div className="space-y-3">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('card')}
                    className="h-auto py-4 flex-col gap-2"
                  >
                    <CreditCard className="w-6 h-6" />
                    <span>Card</span>
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === 'bank' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('bank')}
                    className="h-auto py-4 flex-col gap-2"
                  >
                    <Building2 className="w-6 h-6" />
                    <span>Bank Transfer</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-14 text-lg"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label>Quick Amounts</Label>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_AMOUNTS.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      type="button"
                      variant="outline"
                      onClick={() => handleQuickAmount(quickAmount)}
                      className="h-12"
                    >
                      ₦{quickAmount.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">
                    ₦{amount ? parseFloat(amount).toLocaleString() : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="font-semibold">₦0.00</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold text-primary">
                    ₦{amount ? parseFloat(amount).toLocaleString() : '0.00'}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Cash
                  </>
                )}
              </Button>
            </form>
          </Card>

          <Card className="p-4 border-0 bg-muted/30">
            <p className="text-sm text-muted-foreground text-center">
              🔒 Your payment information is secure and encrypted
            </p>
          </Card>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
