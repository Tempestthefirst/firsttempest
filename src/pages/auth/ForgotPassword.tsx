import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function ForgotPassword() {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phone.length < 10) {
      toast.error('Phone number must be at least 10 digits');
      return;
    }

    if (pin.length < 4 || pin.length > 6) {
      toast.error('PIN must be 4-6 digits');
      return;
    }

    setLoading(true);
    
    try {
      // Find user by phone number and verify PIN
      const phoneClean = phone.replace(/[^0-9]/g, '');
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, pin_hash')
        .eq('phone_number', phoneClean)
        .maybeSingle();

      if (profileError || !profile) {
        toast.error('No account found with this phone number');
        setLoading(false);
        return;
      }

      // Simple PIN verification (in production, use proper hashing)
      if (profile.pin_hash !== pin) {
        toast.error('Invalid PIN');
        setLoading(false);
        return;
      }

      // PIN verified - log in using magic link or session
      // For MVP, we'll use the phone-based email format
      const email = `${phoneClean}@firstpay.user`;
      
      // Since we can't log in without password in this flow,
      // we'll show a success and redirect to login
      toast.success('PIN verified! Please use your password to login.');
      navigate('/auth/login');
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Link 
            to="/auth/login" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back to login"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to login</span>
          </Link>
        </motion.div>

        {/* Logo */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <img
            src={logo}
            alt="FirstPay Logo"
            className="w-28 h-auto mx-auto"
          />
        </motion.div>

        {/* PIN Login card */}
        <Card className="p-8 shadow-banking-lg border border-border">
          <h1 className="text-2xl font-semibold text-foreground mb-2">PIN Recovery</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Enter your phone number and PIN to verify your identity
          </p>

          <form onSubmit={handlePinLogin} className="space-y-5">
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
              <label className="text-sm font-medium text-foreground">Your PIN</label>
              <Input
                type="password"
                placeholder="••••••"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="h-12 text-center text-2xl tracking-widest"
                inputMode="numeric"
                aria-label="PIN"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Enter your 4-6 digit PIN</p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium"
              disabled={loading}
              aria-label="Verify PIN"
            >
              {loading ? 'Verifying...' : 'Verify PIN'}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
