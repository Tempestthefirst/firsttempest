import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useWallet } from '@/hooks/useWallet';
import { useEnhancedTransfer } from '@/hooks/useEnhancedTransfer';
import { useProfile } from '@/hooks/useProfile';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { PinVerificationModal } from '@/components/PinVerificationModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send as SendIcon, Loader2, CheckCircle2, ArrowRight, Search, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

type Step = 'recipient' | 'amount' | 'note' | 'confirm' | 'success';

interface UserProfile {
  id: string;
  full_name: string;
  phone_number: string;
}

export default function Send() {
  const navigate = useNavigate();
  const { wallet } = useWallet();
  const { transfer, isTransferring } = useEnhancedTransfer();
  const { profile } = useProfile();
  const [step, setStep] = useState<Step>('recipient');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);
  const [transactionRef, setTransactionRef] = useState<string | null>(null);

  // Fetch users from database
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch other users' profiles (excluding current user)
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, full_name, phone_number')
          .neq('id', user.id);

        if (error) {
          console.error('Error fetching users:', error);
          return;
        }

        setAvailableUsers(profiles || []);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = availableUsers.filter(u =>
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone_number.includes(searchQuery)
  );

  const handleConfirmClick = () => {
    // Check if user has PIN set up
    if (profile?.pin_hash) {
      setShowPinModal(true);
    } else {
      // No PIN set, proceed directly (for demo purposes)
      handleSendWithPin(undefined);
    }
  };

  const handleSendWithPin = async (pinHash?: string) => {
    if (!selectedUser || !wallet) return;
    
    setShowPinModal(false);
    
    const amountNum = parseFloat(amount);
    if (amountNum > wallet.balance) {
      toast.error('Insufficient balance');
      return;
    }

    const result = await transfer({
      toUserId: selectedUser.id,
      amount: amountNum,
      description: note || 'Money transfer',
      pin: pinHash ? undefined : undefined, // PIN already hashed
    });
    
    // If we have a pinHash, we need to call with the hash directly
    if (pinHash) {
      const resultWithPin = await supabase.rpc('transfer_money_v2', {
        p_to_user_id: selectedUser.id,
        p_amount: amountNum,
        p_description: note || 'Money transfer',
        p_pin_hash: pinHash,
      });
      
      if (resultWithPin.error) {
        toast.error('Transfer failed');
        return;
      }
      
      const data = resultWithPin.data as unknown as { success: boolean; error?: string; reference?: string };
      if (data.success) {
        setTransactionRef(data.reference || null);
        setStep('success');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#16a34a', '#15803d'],
        });
      } else {
        toast.error(data.error || 'Transfer failed');
      }
      return;
    }
    
    if (result.success) {
      setTransactionRef(result.reference || null);
      setStep('success');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#16a34a', '#15803d'],
      });
    } else {
      toast.error(result.error || 'Transfer failed');
    }
  };

  const goBack = () => {
    switch (step) {
      case 'amount':
        setStep('recipient');
        break;
      case 'note':
        setStep('amount');
        break;
      case 'confirm':
        setStep('note');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  if (!wallet) {
    return (
      <div className="min-h-screen pb-24 bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-background">
      <Header />

      <div className="max-w-lg mx-auto px-4 pt-20">
        {step !== 'success' && (
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Select Recipient */}
          {step === 'recipient' && (
            <motion.div
              key="recipient"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center">
                  <SendIcon className="w-6 h-6 text-background" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Send Money</h1>
                  <p className="text-muted-foreground text-sm">Select recipient</p>
                </div>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              <Card className="border-0 shadow-banking-lg overflow-hidden">
                <div className="divide-y divide-border max-h-[50vh] overflow-y-auto">
                  {loadingUsers ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </div>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((recipient) => (
                      <motion.button
                        key={recipient.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedUser(recipient);
                          setStep('amount');
                        }}
                        className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                      >
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>{recipient.full_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{recipient.full_name}</p>
                          <p className="text-sm text-muted-foreground">{recipient.phone_number}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </motion.button>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No users found</p>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Enter Amount */}
          {step === 'amount' && (
            <motion.div
              key="amount"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <Avatar className="w-16 h-16 mx-auto mb-3">
                  <AvatarFallback>{selectedUser?.full_name[0]}</AvatarFallback>
                </Avatar>
                <p className="font-semibold">{selectedUser?.full_name}</p>
              </div>

              <Card className="p-6 border-0 shadow-banking-lg">
                <Label className="text-center block mb-4 text-muted-foreground">
                  Enter Amount
                </Label>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-3xl font-bold">₦</span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-4xl font-bold text-center border-0 bg-transparent h-auto p-0 focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ width: `${Math.max(3, amount.length + 1)}ch` }}
                    inputMode="numeric"
                    autoFocus
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Available: ₦{wallet.balance.toLocaleString()}
                </p>

                <Button
                  onClick={() => setStep('note')}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full h-12 mt-6 bg-foreground text-background hover:bg-foreground/90"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Add Note */}
          {step === 'note' && (
            <motion.div
              key="note"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 border-0 shadow-banking-lg">
                <h2 className="text-xl font-bold mb-4">Add a note (optional)</h2>
                <Input
                  placeholder="What's this for?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="h-12 mb-6"
                />
                <Button
                  onClick={() => setStep('confirm')}
                  className="w-full h-12 bg-foreground text-background hover:bg-foreground/90"
                >
                  Review Transfer
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 border-0 shadow-banking-lg">
                <h2 className="text-xl font-bold mb-6 text-center">Confirm Transfer</h2>
                
                <div className="text-center mb-6">
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarFallback>{selectedUser?.full_name[0]}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold">{selectedUser?.full_name}</p>
                </div>

                <div className="space-y-3 p-4 bg-muted/50 rounded-xl mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold text-lg">₦{parseFloat(amount).toLocaleString()}</span>
                  </div>
                  {note && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Note</span>
                      <span className="font-medium">{note}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee</span>
                    <span className="font-medium">₦0</span>
                  </div>
                </div>

                <Button
                  onClick={handleConfirmClick}
                  disabled={isTransferring}
                  className="w-full h-12 bg-success hover:bg-success/90 text-white font-semibold"
                >
                  {isTransferring ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <SendIcon className="w-5 h-5 mr-2" />
                      Send ₦{parseFloat(amount).toLocaleString()}
                    </>
                  )}
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Step 5: Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="w-24 h-24 rounded-full bg-success flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-12 h-12 text-white" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold mb-2">Transfer Successful!</h2>
                <p className="text-muted-foreground mb-2">
                  ₦{parseFloat(amount).toLocaleString()} sent to {selectedUser?.full_name}
                </p>
                {transactionRef && (
                  <p className="text-xs text-muted-foreground font-mono mb-2">
                    Ref: {transactionRef}
                  </p>
                )}
                {note && (
                  <p className="text-sm text-muted-foreground">"{note}"</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8"
              >
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="w-full h-12 bg-foreground text-background"
                >
                  Done
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PinVerificationModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handleSendWithPin}
        title="Confirm Transfer"
        subtitle="Enter your PIN to send money"
      />

      <BottomNav />
    </div>
  );
}
