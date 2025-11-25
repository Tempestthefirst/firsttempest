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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send as SendIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Send() {
  const navigate = useNavigate();
  const { user, allUsers, sendMoney } = useStore();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const availableUsers = allUsers.filter(u => u.id !== user.id);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId) {
      toast.error('Please select a recipient');
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amountNum > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsLoading(true);
    try {
      const success = await sendMoney(selectedUserId, amountNum, description || 'Money transfer');
      if (success) {
        toast.success(`₦${amountNum} sent successfully!`);
        navigate('/dashboard');
      } else {
        toast.error('Transfer failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
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
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <SendIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Send Money</h1>
              <p className="text-muted-foreground">Transfer to another user</p>
            </div>
          </div>

          <Card className="p-6 border-0 shadow-banking-lg mb-6">
            <form onSubmit={handleSend} className="space-y-6">
              <div className="space-y-3">
                <Label>Select Recipient</Label>
                <div className="space-y-2">
                  {availableUsers.map((recipient) => (
                    <motion.button
                      key={recipient.id}
                      type="button"
                      onClick={() => setSelectedUserId(recipient.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        selectedUserId === recipient.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={recipient.avatar} />
                        <AvatarFallback>{recipient.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-semibold">{recipient.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {recipient.id}</p>
                      </div>
                    </motion.button>
                  ))}
                  {availableUsers.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No users available</p>
                  )}
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
                <p className="text-sm text-muted-foreground">
                  Available: ₦{user.balance.toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="What's this for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-12"
                />
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
                    <SendIcon className="w-5 h-5 mr-2" />
                    Send Money
                  </>
                )}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
