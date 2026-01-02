import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Lock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  error?: string;
  attemptsRemaining?: number;
  isLocked?: boolean;
  lockTimeRemaining?: number;
  disabled?: boolean;
  title?: string;
  subtitle?: string;
}

export function PinInput({
  length = 6,
  onComplete,
  error,
  attemptsRemaining,
  isLocked = false,
  lockTimeRemaining,
  disabled = false,
  title = 'Enter PIN',
  subtitle = 'Enter your 6-digit PIN to continue',
}: PinInputProps) {
  const [pin, setPin] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (!disabled && !isLocked) {
      inputRefs.current[0]?.focus();
    }
  }, [disabled, isLocked]);

  useEffect(() => {
    // Clear PIN on error
    if (error) {
      setPin(new Array(length).fill(''));
      inputRefs.current[0]?.focus();
    }
  }, [error, length]);

  const handleChange = (index: number, value: string) => {
    if (disabled || isLocked) return;

    // Only allow single digit
    const digit = value.replace(/\D/g, '').slice(-1);
    
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);

    // Move to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (digit && index === length - 1) {
      const fullPin = newPin.join('');
      if (fullPin.length === length) {
        onComplete(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (disabled || isLocked) return;

    if (e.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      const newPin = [...pin];
      newPin[index] = '';
      setPin(newPin);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled || isLocked) return;
    
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    
    if (pastedData) {
      const newPin = [...pin];
      pastedData.split('').forEach((digit, idx) => {
        if (idx < length) {
          newPin[idx] = digit;
        }
      });
      setPin(newPin);
      
      if (pastedData.length === length) {
        onComplete(pastedData);
      } else {
        inputRefs.current[pastedData.length]?.focus();
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-primary" />
      </div>
      
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm mb-6">{subtitle}</p>

      {isLocked ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center p-4 bg-destructive/10 rounded-xl"
        >
          <AlertCircle className="w-8 h-8 text-destructive mb-2" />
          <p className="font-semibold text-destructive">PIN Locked</p>
          <p className="text-sm text-muted-foreground">
            Try again in {lockTimeRemaining} minutes
          </p>
        </motion.div>
      ) : (
        <>
          <div className="flex gap-2 mb-4 justify-center" onPaste={handlePaste}>
            {pin.map((digit, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Input
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={disabled || isLocked}
                  className={cn(
                    'w-11 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold',
                    'border-2 rounded-xl transition-all',
                    digit ? 'border-primary bg-primary/5' : 'border-border',
                    error && 'border-destructive bg-destructive/5 animate-shake'
                  )}
                  aria-label={`PIN digit ${index + 1}`}
                />
              </motion.div>
            ))}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-destructive text-sm font-medium flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.p>
          )}

          {attemptsRemaining !== undefined && attemptsRemaining < 5 && !error && (
            <p className="text-sm text-muted-foreground">
              {attemptsRemaining} attempts remaining
            </p>
          )}
        </>
      )}
    </div>
  );
}
