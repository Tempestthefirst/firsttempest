import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Shield } from 'lucide-react';
import logo from '@/assets/logo.png';

interface SignupStep2Props {
  onNext: (pin: string) => void;
  onBack: () => void;
}

export default function SignupStep2({ onNext, onBack }: SignupStep2Props) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length < 4 || pin.length > 6) {
      toast.error('PIN must be 4-6 digits');
      return;
    }

    if (pin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }

    setLoading(true);
    
    // Simulate brief processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onNext(pin);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
        </motion.div>

        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <img
            src={logo}
            alt="FirstPay Logo"
            className="w-28 h-auto mx-auto mb-2"
          />
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-1 rounded-full bg-primary" />
          <div className="w-8 h-1 rounded-full bg-primary" />
          <div className="w-8 h-1 rounded-full bg-border" />
        </div>

        {/* PIN Setup card */}
        <Card className="p-8 shadow-banking-lg border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Set Your PIN</h1>
              <p className="text-muted-foreground text-sm">Step 2 of 3</p>
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm mb-6">
            Create a secure PIN for quick access and transaction authorization
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Create PIN</label>
              <Input
                type="password"
                placeholder="••••••"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="h-14 text-center text-3xl tracking-[0.5em]"
                inputMode="numeric"
                aria-label="Create PIN"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">4-6 digits</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirm PIN</label>
              <Input
                type="password"
                placeholder="••••••"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="h-14 text-center text-3xl tracking-[0.5em]"
                inputMode="numeric"
                aria-label="Confirm PIN"
                disabled={loading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium mt-2"
              disabled={loading || pin.length < 4}
              aria-label="Continue"
            >
              {loading ? 'Processing...' : 'Continue'}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
