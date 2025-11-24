import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, Calendar, Target, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { RoomCard } from '@/components/RoomCard';

export default function MoneyRooms() {
  const [activeTab, setActiveTab] = useState('my-rooms');
  const [roomName, setRoomName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [unlockType, setUnlockType] = useState<'target' | 'date' | 'both'>('target');
  const [joinRoomId, setJoinRoomId] = useState('');

  const { user, rooms, createRoom, joinRoom } = useStore();
  const navigate = useNavigate();

  if (!user) return null;

  const myRooms = rooms.filter((room) =>
    room.contributors.some((c) => c.name === user.name)
  );

  const handleCreateRoom = (e: React.FormEvent) => {
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

    const roomId = createRoom({
      name: roomName,
      targetAmount: parseFloat(targetAmount) || 0,
      unlockDate: unlockDate ? new Date(unlockDate) : undefined,
      unlockType,
      createdBy: user.name,
    });

    toast.success(`Room "${roomName}" created! ID: ${roomId}`);
    setRoomName('');
    setTargetAmount('');
    setUnlockDate('');
    setActiveTab('my-rooms');
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!joinRoomId.trim()) {
      toast.error('Please enter a room ID');
      return;
    }

    const room = await joinRoom(joinRoomId.toUpperCase());
    if (room) {
      toast.success(`Joined room: ${room.name}`);
      navigate(`/room/${room.id}`);
    } else {
      toast.error('Room not found');
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <BackButton to="/" />
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
                {myRooms.length === 0 ? (
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
                  myRooms.map((room, index) => (
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
                      <label className="text-sm font-medium">Target Amount ($)</label>
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

                  <Button type="submit" className="w-full h-12 gradient-primary border-0">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Room
                  </Button>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="join" className="mt-6">
              <Card className="p-6 border-0">
                <form onSubmit={handleJoinRoom} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Room ID</label>
                    <Input
                      placeholder="Enter room ID"
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                      className="h-12 text-center text-lg tracking-wider font-mono"
                    />
                    <p className="text-sm text-muted-foreground">
                      Ask the room creator for the room ID
                    </p>
                  </div>

                  <Button type="submit" className="w-full h-12 gradient-secondary border-0">
                    <Search className="w-5 h-5 mr-2" />
                    Find Room
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
