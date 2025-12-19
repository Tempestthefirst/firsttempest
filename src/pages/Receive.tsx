import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { useWallet } from '@/hooks/useWallet';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Building2, ArrowDownToLine, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Receive() {
  const { profile, loading: profileLoading } = useProfile();
  const { wallet, loading: walletLoading } = useWallet();

  const isPageLoading = profileLoading || walletLoading;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const handleShare = () => {
    const accountNumber = wallet?.virtual_account_number || '0012345678';
    const bankName = wallet?.virtual_account_bank || 'FirstPay';
    const name = profile?.full_name || 'User';
    
    if (navigator.share) {
      navigator.share({
        title: 'Send me money on SplitSpace',
        text: `Send money to ${name}\nAccount: ${accountNumber}\nBank: ${bankName}`,
      });
    } else {
      handleCopy(accountNumber, 'Account number');
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen pb-24 bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const name = profile?.full_name || 'User';
  const initials = name[0]?.toUpperCase() || 'U';
  const accountNumber = wallet?.virtual_account_number || '0012345678';
  const bankName = wallet?.virtual_account_bank || 'FirstPay';

  return (
    <div className="min-h-screen pb-24 bg-background">
      <Header />

      <div className="max-w-lg mx-auto px-4 pt-20">
        <BackButton fallback="/dashboard" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center">
              <ArrowDownToLine className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Receive Money</h1>
              <p className="text-muted-foreground text-sm">Share your details</p>
            </div>
          </div>

          {/* User ID Card */}
          <Card className="p-6 border-0 shadow-banking-lg mb-4">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-24 h-24 mx-auto rounded-full bg-foreground flex items-center justify-center mb-4"
              >
                <span className="text-4xl font-bold text-background">
                  {initials}
                </span>
              </motion.div>

              <h2 className="text-xl font-bold mb-1">{name}</h2>
              <p className="text-sm text-muted-foreground mb-6">Share your account details to receive</p>
            </div>
          </Card>

          {/* Bank Transfer Details */}
          <Card className="p-6 border-0 shadow-banking-lg">
            <h3 className="font-bold mb-4">Bank Transfer Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground">Bank</p>
                  <p className="font-medium">{bankName}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground">Account Name</p>
                  <p className="font-medium">{name}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground">Account Number</p>
                  <p className="font-mono font-bold text-lg">{accountNumber}</p>
                </div>
                <button
                  onClick={() => handleCopy(accountNumber, 'Account number')}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Copy account number"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => handleCopy(`${accountNumber} - ${name} - ${bankName}`, 'Details')}
                variant="outline"
                className="flex-1 h-12"
              >
                <Copy className="w-5 h-5 mr-2" />
                Copy All
              </Button>
              <Button
                onClick={handleShare}
                className="flex-1 h-12 bg-foreground text-background hover:bg-foreground/90"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
