import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { useWallet } from '@/hooks/useWallet';
import { useRooms } from '@/hooks/useRooms';
import { useTransactions } from '@/hooks/useTransactions';
import { useAdminRole } from '@/hooks/useAdminRole';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserIcon, Users, Wallet, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Profile() {
  const { profile, loading: profileLoading } = useProfile();
  const { wallet, loading: walletLoading } = useWallet();
  const { rooms, loading: roomsLoading } = useRooms();
  const { transactions, loading: txLoading } = useTransactions();
  const { isAdmin } = useAdminRole();
  const navigate = useNavigate();

  const isPageLoading = profileLoading || walletLoading || roomsLoading || txLoading;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/auth/login');
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const avatarUrl = profile ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}` : '';
  const initials = profile?.full_name?.[0]?.toUpperCase() || 'U';
  const balance = wallet?.balance ?? 0;
  const activeRooms = rooms.filter(r => r.status === 'active').length;
  const unlockedRooms = rooms.filter(r => r.status === 'unlocked').length;

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <BackButton fallback="/dashboard" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          {/* Profile Header */}
          <Card className="p-6 mb-6 border-0 gradient-primary text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10 flex items-center gap-4">
              <Avatar className="w-20 h-20 ring-4 ring-white/30">
                <AvatarImage src={avatarUrl} alt={profile?.full_name || 'User'} />
                <AvatarFallback className="text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold mb-1">{profile?.full_name || 'User'}</h1>
                <p className="text-white/80">Member since {new Date().getFullYear()}</p>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4 text-center border-0">
              <Wallet className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">₦{balance.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Balance</p>
            </Card>

            <Card className="p-4 text-center border-0">
              <Users className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold">{rooms.length}</p>
              <p className="text-sm text-muted-foreground">Rooms</p>
            </Card>

            <Card className="p-4 text-center border-0">
              <UserIcon className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold">{transactions.length}</p>
              <p className="text-sm text-muted-foreground">Transactions</p>
            </Card>
          </div>

          {/* Room Activity */}
          <Card className="p-6 mb-6 border-0">
            <h2 className="text-xl font-semibold mb-4">Room Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Active Rooms</span>
                <span className="font-semibold">{activeRooms}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Total Rooms</span>
                <span className="font-semibold">{rooms.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Unlocked Rooms</span>
                <span className="font-semibold">{unlockedRooms}</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6 border-0 space-y-3">
            <h2 className="text-xl font-semibold mb-4">Account</h2>
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => navigate('/settings')}
            >
              Settings
            </Button>
            {isAdmin && (
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={() => navigate('/admin')}
              >
                Admin Panel
              </Button>
            )}
            <Button
              variant="destructive"
              className="w-full h-12"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </Card>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
