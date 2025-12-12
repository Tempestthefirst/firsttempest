import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownToLine, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Receive() {
  const { user } = useStore();

  if (!user) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Send me money on SplitSpace',
        text: `Send money to ${user.name}\nUser ID: ${user.id}\nAccount: ${user.virtualAccountNumber || '0012345678'}\nBank: ${user.virtualAccountBank || 'SplitSpace Bank'}`,
      });
    } else {
      handleCopy(user.id, 'User ID');
    }
  };

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
                  {user.name[0].toUpperCase()}
                </span>
              </motion.div>

              <h2 className="text-xl font-bold mb-1">{user.name}</h2>
              <p className="text-sm text-muted-foreground mb-6">Share your User ID to receive</p>

              <div className="p-4 bg-muted/50 rounded-xl mb-4">
                <p className="text-xs text-muted-foreground mb-1">User ID</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-2xl font-mono font-bold">{user.id}</p>
                  <button
                    onClick={() => handleCopy(user.id, 'User ID')}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Copy user ID"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Bank Transfer Details */}
          <Card className="p-6 border-0 shadow-banking-lg">
            <h3 className="font-bold mb-4">Bank Transfer Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground">Bank</p>
                  <p className="font-medium">{user.virtualAccountBank || 'SplitSpace Bank'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground">Account Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground">Account Number</p>
                  <p className="font-mono font-bold text-lg">{user.virtualAccountNumber || '0012345678'}</p>
                </div>
                <button
                  onClick={() => handleCopy(user.virtualAccountNumber || '0012345678', 'Account number')}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Copy account number"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => handleCopy(`${user.virtualAccountNumber || '0012345678'} - ${user.name} - ${user.virtualAccountBank || 'SplitSpace Bank'}`, 'Details')}
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
