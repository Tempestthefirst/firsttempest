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

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    toast.success('User ID copied to clipboard!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Send me money',
        text: `Send money to ${user.name}. User ID: ${user.id}`,
      });
    } else {
      handleCopyId();
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
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <ArrowDownToLine className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Receive Money</h1>
              <p className="text-muted-foreground">Share your details to get paid</p>
            </div>
          </div>

          <Card className="p-8 border-0 shadow-banking-lg text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="space-y-6"
            >
              <div className="w-32 h-32 mx-auto rounded-full gradient-secondary flex items-center justify-center">
                <span className="text-5xl font-bold text-white">
                  {user.name[0].toUpperCase()}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
                <p className="text-muted-foreground">Share your User ID to receive payments</p>
              </div>

              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-sm text-muted-foreground mb-2">Your User ID</p>
                <p className="text-2xl font-mono font-bold tracking-wider">{user.id}</p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleCopyId}
                  variant="outline"
                  className="flex-1 h-12"
                >
                  <Copy className="w-5 h-5 mr-2" />
                  Copy ID
                </Button>
                <Button
                  onClick={handleShare}
                  className="flex-1 h-12"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
              </div>

              <div className="pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  Anyone with your User ID can send you money instantly
                </p>
              </div>
            </motion.div>
          </Card>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
