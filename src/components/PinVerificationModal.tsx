import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PinInput } from './PinInput';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { usePinVerification } from '@/hooks/usePinVerification';

interface PinVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pinHash: string) => void;
  title?: string;
  subtitle?: string;
}

export function PinVerificationModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Enter PIN',
  subtitle = 'Enter your 6-digit PIN to confirm',
}: PinVerificationModalProps) {
  const { verifyPin, isVerifying, isLocked, getRemainingLockTime } = usePinVerification();
  const [error, setError] = useState<string | undefined>();
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | undefined>();

  const handlePinComplete = async (pin: string) => {
    setError(undefined);
    
    const result = await verifyPin(pin);
    
    if (result.success && result.pinHash) {
      onSuccess(result.pinHash);
    } else {
      setError(result.error || 'Invalid PIN');
      if (result.attemptsRemaining !== undefined) {
        setAttemptsRemaining(result.attemptsRemaining);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm bg-card rounded-2xl shadow-xl p-6 relative"
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={onClose}
            disabled={isVerifying}
          >
            <X className="w-5 h-5" />
          </Button>

          {isVerifying ? (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Verifying...</p>
            </div>
          ) : (
            <PinInput
              length={6}
              onComplete={handlePinComplete}
              error={error}
              attemptsRemaining={attemptsRemaining}
              isLocked={isLocked}
              lockTimeRemaining={getRemainingLockTime()}
              title={title}
              subtitle={subtitle}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
