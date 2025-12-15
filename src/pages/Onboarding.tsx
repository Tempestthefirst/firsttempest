import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';
import SplashScreen from './SplashScreen';

export default function Onboarding() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const navigate = useNavigate();
  const { login, signup } = useStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (name.length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      toast.error('PIN must be exactly 4 digits');
      return;
    }

    if (isLogin) {
      const success = login(name, pin);
      if (success) {
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        toast.error('Invalid credentials');
      }
    } else {
      signup(name, pin);
      toast.success('Account created! Welcome to FirstPay');
      navigate('/dashboard');
    }
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showSplash ? 0 : 1, y: showSplash ? 20 : 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <img
              src={logo}
              alt="FirstPay Logo"
              className="w-32 h-auto mx-auto mb-4"
            />
            <p className="text-muted-foreground text-sm">
              Secure, simple, and built for you
            </p>
          </motion.div>

          {/* Auth card */}
          <Card className="p-8 shadow-banking-lg border border-border">
            <div className="flex gap-2 mb-6">
              <Button
                variant={isLogin ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setIsLogin(true)}
                aria-label="Switch to login"
              >
                Login
              </Button>
              <Button
                variant={!isLogin ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setIsLogin(false)}
                aria-label="Switch to sign up"
              >
                Sign Up
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Name</label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12"
                  aria-label="Name input"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">4-Digit PIN</label>
                <Input
                  type="password"
                  placeholder="••••"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="h-12 text-center text-2xl tracking-widest"
                  inputMode="numeric"
                  aria-label="PIN input"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base"
                aria-label={isLogin ? 'Login' : 'Create account'}
              >
                {isLogin ? 'Login' : 'Create Account'}
              </Button>
            </form>
          </Card>

          <motion.p
            className="text-center text-muted-foreground text-xs mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            By continuing, you agree to our Terms & Privacy Policy
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}
