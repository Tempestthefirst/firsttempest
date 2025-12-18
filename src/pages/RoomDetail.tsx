import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useWallet } from '@/hooks/useWallet';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Calendar, Target, Unlock, Plus, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface RoomData {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  unlock_date: string | null;
  unlock_type: string;
  status: string;
  invite_code: string;
  creator_id: string;
}

interface Contributor {
  user_id: string;
  amount: number;
  full_name: string;
}

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { wallet, refetch: refetchWallet } = useWallet();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [contributing, setContributing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) return;

      try {
        // Fetch room data
        const { data: roomData, error: roomError } = await supabase
          .from('money_rooms')
          .select('*')
          .eq('id', id)
          .single();

        if (roomError) throw roomError;
        setRoom(roomData);

        // Fetch contributions with user profiles
        const { data: contributions, error: contribError } = await supabase
          .from('room_contributions')
          .select(`
            user_id,
            amount
          `)
          .eq('room_id', id);

        if (contribError) throw contribError;

        // Aggregate contributions by user
        const userTotals: Record<string, number> = {};
        contributions?.forEach(c => {
          userTotals[c.user_id] = (userTotals[c.user_id] || 0) + Number(c.amount);
        });

        // Fetch user names
        const userIds = Object.keys(userTotals);
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);

          const contributorList: Contributor[] = userIds.map(userId => ({
            user_id: userId,
            amount: userTotals[userId],
            full_name: profiles?.find(p => p.id === userId)?.full_name || 'Unknown',
          }));

          setContributors(contributorList);
        }
      } catch (err) {
        console.error('Error fetching room:', err);
        toast.error('Failed to load room');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  useEffect(() => {
    if (room?.status === 'unlocked') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [room?.status]);

  const handleContribute = async () => {
    if (!room || !wallet) return;

    const contributionAmount = parseFloat(amount);

    if (!contributionAmount || contributionAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (contributionAmount > wallet.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setContributing(true);
    try {
      // Use secure RPC for contribution
      const { data, error } = await supabase.rpc('contribute_to_room', {
        p_room_id: room.id,
        p_amount: contributionAmount
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; new_room_amount?: number };

      if (!result.success) {
        toast.error(result.error || 'Contribution failed');
        return;
      }

      toast.success(`Contributed ₦${contributionAmount.toLocaleString()} to ${room.name}`);
      setAmount('');
      
      // Update room amount locally
      setRoom(prev => prev ? { ...prev, current_amount: result.new_room_amount || prev.current_amount + contributionAmount } : null);
      
      // Refetch wallet balance
      refetchWallet();

      // Refetch contributors
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setContributors(prev => {
          const existing = prev.find(c => c.user_id === user.id);
          if (existing) {
            return prev.map(c => c.user_id === user.id ? { ...c, amount: c.amount + contributionAmount } : c);
          }
          return [...prev, { user_id: user.id, amount: contributionAmount, full_name: 'You' }];
        });
      }
    } catch (err) {
      console.error('Error contributing:', err);
      toast.error('Failed to contribute');
    } finally {
      setContributing(false);
    }
  };

  const copyInviteCode = async () => {
    if (!room) return;
    try {
      await navigator.clipboard.writeText(room.invite_code);
      setCopied(true);
      toast.success('Invite code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Room not found</p>
      </div>
    );
  }

  const progress = room.target_amount > 0 ? (room.current_amount / room.target_amount) * 100 : 0;
  const daysLeft = room.unlock_date
    ? Math.ceil((new Date(room.unlock_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const isUnlocked = room.status === 'unlocked';

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <BackButton to="/rooms" label="Back to Rooms" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          {/* Room Header */}
          <Card className="p-6 mb-6 gradient-primary text-white border-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">{room.name}</h1>
                {isUnlocked ? (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Unlock className="w-5 h-5" />
                    <span className="font-semibold">Unlocked!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">{contributors.length}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <p className="text-white/80">Code: {room.invite_code}</p>
                <button
                  onClick={copyInviteCode}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label="Copy invite code"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </Card>

          {/* Progress Section */}
          {room.unlock_type !== 'date' && (
            <Card className="p-6 mb-6 border-0">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Target Progress</h2>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl font-bold text-primary">
                  ₦{room.current_amount.toLocaleString()}
                </span>
                <span className="text-lg text-muted-foreground">
                  of ₦{room.target_amount.toLocaleString()}
                </span>
              </div>

              <Progress value={Math.min(progress, 100)} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {progress.toFixed(1)}% complete
              </p>
            </Card>
          )}

          {/* Time Progress */}
          {(room.unlock_type === 'date' || room.unlock_type === 'both') && room.unlock_date && (
            <Card className="p-6 mb-6 border-0">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-secondary" />
                <h2 className="text-xl font-semibold">Unlock Date</h2>
              </div>

              <p className="text-3xl font-bold mb-2">
                {new Date(room.unlock_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>

              {daysLeft !== null && daysLeft > 0 && (
                <p className="text-muted-foreground">{daysLeft} days remaining</p>
              )}
              {daysLeft !== null && daysLeft <= 0 && (
                <p className="text-destructive">Unlock date has passed!</p>
              )}
            </Card>
          )}

          {/* Contribute Section */}
          {!isUnlocked && wallet && (
            <Card className="p-6 mb-6 border-0">
              <h2 className="text-xl font-semibold mb-4">Contribute</h2>
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12"
                />
                <Button
                  onClick={handleContribute}
                  className="h-12 gradient-primary border-0"
                  disabled={contributing}
                >
                  {contributing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Add Funds
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Your balance: ₦{wallet.balance.toLocaleString()}
              </p>
            </Card>
          )}

          {/* Contributors */}
          <Card className="p-6 border-0">
            <h2 className="text-xl font-semibold mb-4">Contributors</h2>
            <div className="space-y-3">
              {contributors.map((contributor, index) => (
                <motion.div
                  key={contributor.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{contributor.full_name[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{contributor.full_name}</span>
                  </div>
                  <span className="font-semibold text-primary">
                    ₦{contributor.amount.toLocaleString()}
                  </span>
                </motion.div>
              ))}

              {contributors.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No contributions yet. Be the first!
                </p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
