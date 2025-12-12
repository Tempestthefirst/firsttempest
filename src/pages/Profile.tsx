import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User as UserIcon, Wallet, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, logout, transactions, rooms } = useStore();
  const navigate = useNavigate();

  if (!user) return null;

  const myRooms = rooms.filter((room) =>
    room.contributors.some((c) => c.name === user.name)
  );
  const totalContributions = myRooms.reduce(
    (acc, room) =>
      acc + (room.contributors.find((c) => c.name === user.name)?.amount || 0),
    0
  );

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

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
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl">
                  {user.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
                <p className="text-white/80">Member since {new Date().getFullYear()}</p>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4 text-center border-0">
              <Wallet className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">${user.balance.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground">Balance</p>
            </Card>

            <Card className="p-4 text-center border-0">
              <Users className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold">{myRooms.length}</p>
              <p className="text-sm text-muted-foreground">Rooms</p>
            </Card>

            <Card className="p-4 text-center border-0">
              <UserIcon className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold">{transactions.length}</p>
              <p className="text-sm text-muted-foreground">Transactions</p>
            </Card>
          </div>

          {/* Room Contributions */}
          <Card className="p-6 mb-6 border-0">
            <h2 className="text-xl font-semibold mb-4">Room Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Active Rooms</span>
                <span className="font-semibold">
                  {myRooms.filter((r) => !r.isUnlocked).length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Total Contributions</span>
                <span className="font-semibold">${totalContributions.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Unlocked Rooms</span>
                <span className="font-semibold">
                  {myRooms.filter((r) => r.isUnlocked).length}
                </span>
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
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => navigate('/admin')}
            >
              Admin Panel
            </Button>
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
