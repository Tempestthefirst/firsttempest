import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { z } from 'zod';
import logo from '@/assets/logo.png';

const signupSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters').max(100, 'Name too long'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^[0-9+]+$/, 'Invalid phone format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain letters')
    .regex(/[0-9]/, 'Password must contain numbers'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface SignupStep1Props {
  onNext: (data: { fullName: string; phone: string; password: string }) => void;
}

export default function SignupStep1({ onNext }: SignupStep1Props) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signupSchema.safeParse({ fullName, phone, password, confirmPassword });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);
    
    // Simulate brief processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onNext({ fullName, phone, password });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
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
          <div className="w-8 h-1 rounded-full bg-border" />
          <div className="w-8 h-1 rounded-full bg-border" />
        </div>

        {/* Signup card */}
        <Card className="p-8 shadow-banking-lg border border-border">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground text-sm mb-6">Step 1 of 3: Personal Information</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Government Name</label>
              <Input
                type="text"
                placeholder="As it appears on your ID"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12"
                aria-label="Full name"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone Number</label>
              <Input
                type="tel"
                placeholder="08012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12"
                inputMode="tel"
                aria-label="Phone number"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                placeholder="Min. 8 characters, alphanumeric"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
                aria-label="Password"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirm Password</label>
              <Input
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12"
                aria-label="Confirm password"
                disabled={loading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium mt-2"
              disabled={loading}
              aria-label="Create account"
            >
              {loading ? 'Processing...' : 'Create Account'}
            </Button>
          </form>
        </Card>

        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-muted-foreground text-sm">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
