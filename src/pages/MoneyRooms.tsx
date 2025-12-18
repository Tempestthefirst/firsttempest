import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, Calendar, Target, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { RoomCard } from '@/components/RoomCard';
import { RoomCardSkeleton } from '@/components/ui/skeleton';
import { useRooms } from '@/hooks/useRooms';
import { supabase } from '@/integrations/supabase/client';

// Map frontend unlock types to database enum values
const unlockTypeToDb = (type: 'target' | 'date' | 'both'): 'target_reached' | 'date_reached' | 'manual' => {
  switch (type) {
    case 'target': return 'target_reached';
    case 'date': return 'date_reached';
    case 'both': return 'manual'; // 'both' maps to manual since it requires both conditions
    default: return 'target_reached';
  }
};

// Map database enum values to frontend unlock types
const dbToUnlockType = (dbType: string): 'target' | 'date' | 'both' => {
  switch (dbType) {
    case 'target_reached': return 'target';
    case 'date_reached': return 'date';
    case 'manual': return 'both';
    default: return 'target';
  }
};

export default function MoneyRooms() {
  const [activeTab, setActiveTab] = useState('my-rooms');
  const [roomName, setRoomName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [unlockType, setUnlockType] = useState<'target' | 'date' | 'both'>('target');
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const { rooms, loading, refetch } = useRooms();
  const navigate = useNavigate();

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    if (unlockType !== 'date' && (!targetAmount || parseFloat(targetAmount) <= 0)) {
      toast.error('Please enter a valid target amount');
      return;
    }

    if (unlockType !== 'target' && !unlockDate) {
      toast.error('Please select an unlock date');
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to create a room');
        return;
      }

      // Generate invite code using database function
      const { data: inviteCode, error: codeError } = await supabase.rpc('generate_invite_code');
      if (codeError) throw codeError;

      // Insert room into database
      const { data: room, error: roomError } = await supabase
        .from('money_rooms')
        .insert({
          name: roomName,
          target_amount: parseFloat(targetAmount) || 0,
          unlock_date: unlockDate ? new Date(unlockDate).toISOString() : null,
          unlock_type: unlockTypeToDb(unlockType),
          creator_id: user.id,
          invite_code: inviteCode,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add creator as first member
      const { error: memberError } = await supabase
        .from('room_members')
        .insert({
          room_id: room.id,
          user_id: user.id,
        });

      if (memberError) throw memberError;

      toast.success(`Room "${roomName}" created! Code: ${inviteCode}`);
      setRoomName('');
      setTargetAmount('');
      setUnlockDate('');
      setActiveTab('my-rooms');
      refetch();
    } catch (err) {
      console.error('Error creating room:', err);
      toast.error('Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!joinCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }

    setIsJoining(true);
    try {
      // Use secure RPC to join room
      const { data, error } = await supabase.rpc('join_room_by_code', {
        p_invite_code: joinCode.toUpperCase()
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; room_id?: string; message?: string };

      if (!result.success) {
        toast.error(result.error || 'Failed to join room');
        return;
      }

      toast.success(result.message || 'Joined room successfully!');
      setJoinCode('');
      refetch();
      
      if (result.room_id) {
        navigate(`/rooms/${result.room_id}`);
      }
    } catch (err) {
      console.error('Error joining room:', err);
      toast.error('Failed to join room');
    } finally {
      setIsJoining(false);
    }
  };

  // Transform database rooms to UI format that matches MoneyRoom interface
  const transformedRooms = rooms.map(room => ({
    id: room.id,
    name: room.name,
    targetAmount: room.target_amount,
    currentAmount: room.current_amount,
    unlockDate: room.unlock_date ? new Date(room.unlock_date) : undefined,
    unlockType: dbToUnlockType(room.unlock_type),
    createdBy: 'Room Creator',
    creatorId: room.creator_id,
    members: [] as string[],
    contributions: [] as { id: string; roomId: string; userId: string; amount: number; status: 'pending' | 'confirmed' | 'refunded'; timestamp: Date }[],
    contributors: [] as { name: string; amount: number; avatar: string }[],
    isUnlocked: room.status === 'unlocked',
    status: room.status === 'unlocked' ? 'unlocked' : 'open' as 'open' | 'unlocked' | 'archived',
    createdAt: new Date(room.created_at),
    inviteCode: room.invite_code,
  }));

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <BackButton fallback="/dashboard" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl gradient-secondary flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Money Rooms</h1>
              <p className="text-muted-foreground">Save together, unlock together</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="my-rooms">My Rooms</TabsTrigger>
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="join">Join</TabsTrigger>
            </TabsList>

            <TabsContent value="my-rooms" className="mt-6">
              <div className="space-y-4">
                {loading ? (
                  <>
                    <RoomCardSkeleton />
                    <RoomCardSkeleton />
                    <RoomCardSkeleton />
                  </>
                ) : transformedRooms.length === 0 ? (
                  <Card className="p-12 text-center border-0">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No rooms yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Create a room or join an existing one to start saving together
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => setActiveTab('create')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Room
                      </Button>
                      <Button variant="outline" onClick={() => setActiveTab('join')}>
                        <Search className="w-4 h-4 mr-2" />
                        Join Room
                      </Button>
                    </div>
                  </Card>
                ) : (
                  transformedRooms.map((room, index) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <RoomCard room={room} onClick={() => navigate(`/rooms/${room.id}`)} />
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="create" className="mt-6">
              <Card className="p-6 border-0">
                <form onSubmit={handleCreateRoom} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Room Name</label>
                    <Input
                      placeholder="e.g., Summer Vacation Fund"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Unlock Condition</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant={unlockType === 'target' ? 'default' : 'outline'}
                        onClick={() => setUnlockType('target')}
                        className="flex-col h-auto py-3"
                      >
                        <Target className="w-5 h-5 mb-1" />
                        <span className="text-xs">Target</span>
                      </Button>
                      <Button
                        type="button"
                        variant={unlockType === 'date' ? 'default' : 'outline'}
                        onClick={() => setUnlockType('date')}
                        className="flex-col h-auto py-3"
                      >
                        <Calendar className="w-5 h-5 mb-1" />
                        <span className="text-xs">Date</span>
                      </Button>
                      <Button
                        type="button"
                        variant={unlockType === 'both' ? 'default' : 'outline'}
                        onClick={() => setUnlockType('both')}
                        className="flex-col h-auto py-3"
                      >
                        <Plus className="w-5 h-5 mb-1" />
                        <span className="text-xs">Both</span>
                      </Button>
                    </div>
                  </div>

                  {unlockType !== 'date' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Target Amount (₦)</label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        className="h-12"
                      />
                    </div>
                  )}

                  {unlockType !== 'target' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Unlock Date</label>
                      <Input
                        type="date"
                        value={unlockDate}
                        onChange={(e) => setUnlockDate(e.target.value)}
                        className="h-12"
                      />
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 gradient-primary border-0"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Create Room
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="join" className="mt-6">
              <Card className="p-6 border-0">
                <form onSubmit={handleJoinRoom} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Room Code</label>
                    <Input
                      placeholder="Enter room code"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="h-12 text-center text-lg tracking-wider font-mono"
                    />
                    <p className="text-sm text-muted-foreground">
                      Ask the room creator for the room code
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 gradient-secondary border-0"
                    disabled={isJoining}
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Find Room
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
