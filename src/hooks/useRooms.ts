import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type MoneyRoom = Tables<'money_rooms'>;
type RoomMember = Tables<'room_members'>;
type RoomContribution = Tables<'room_contributions'>;

interface RoomWithDetails extends MoneyRoom {
  members: RoomMember[];
  contributions: RoomContribution[];
}

interface UseRoomsResult {
  rooms: RoomWithDetails[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  joinRoom: (inviteCode: string) => Promise<{ success: boolean; error?: string; roomId?: string }>;
  contribute: (roomId: string, amount: number) => Promise<{ success: boolean; error?: string; newBalance?: number }>;
  createRoom: (data: CreateRoomData) => Promise<{ success: boolean; error?: string; roomId?: string }>;
}

interface CreateRoomData {
  name: string;
  description?: string;
  target_amount: number;
  unlock_type: 'target_reached' | 'date_reached' | 'manual';
  unlock_date?: string;
}

export function useRooms(): UseRoomsResult {
  const [rooms, setRooms] = useState<RoomWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRooms([]);
        return;
      }

      // Get rooms where user is a member
      const { data: memberRooms, error: memberError } = await supabase
        .from('room_members')
        .select('room_id')
        .eq('user_id', user.id);

      if (memberError) {
        console.error('Error fetching member rooms:', memberError);
        setError(memberError.message);
        return;
      }

      const roomIds = memberRooms?.map(m => m.room_id) || [];

      if (roomIds.length === 0) {
        setRooms([]);
        return;
      }

      // Fetch room details with members and contributions
      const { data: roomsData, error: roomsError } = await supabase
        .from('money_rooms')
        .select(`
          *,
          room_members(*),
          room_contributions(*)
        `)
        .in('id', roomIds);

      if (roomsError) {
        console.error('Error fetching rooms:', roomsError);
        setError(roomsError.message);
        return;
      }

      setRooms((roomsData || []) as unknown as RoomWithDetails[]);
    } catch (err) {
      console.error('Error in useRooms:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRooms();
    });

    return () => subscription.unsubscribe();
  }, [fetchRooms]);

  const joinRoom = useCallback(async (inviteCode: string) => {
    try {
      const { data, error: rpcError } = await supabase.rpc('join_room_by_code', {
        p_invite_code: inviteCode.toUpperCase(),
      });

      if (rpcError) {
        return { success: false, error: rpcError.message };
      }

      const result = data as { success: boolean; error?: string; room_id?: string };
      
      if (result.success) {
        await fetchRooms();
        return { success: true, roomId: result.room_id };
      }

      return { success: false, error: result.error || 'Unknown error' };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [fetchRooms]);

  const contribute = useCallback(async (roomId: string, amount: number) => {
    try {
      const { data, error: rpcError } = await supabase.rpc('contribute_to_room', {
        p_room_id: roomId,
        p_amount: amount,
      });

      if (rpcError) {
        return { success: false, error: rpcError.message };
      }

      const result = data as { success: boolean; error?: string; new_balance?: number };
      
      if (result.success) {
        await fetchRooms();
        return { success: true, newBalance: result.new_balance };
      }

      return { success: false, error: result.error || 'Unknown error' };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [fetchRooms]);

  const createRoom = useCallback(async (data: CreateRoomData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Generate invite code
      const { data: inviteCode, error: codeError } = await supabase.rpc('generate_invite_code');
      
      if (codeError) {
        return { success: false, error: codeError.message };
      }

      // Create the room
      const { data: room, error: roomError } = await supabase
        .from('money_rooms')
        .insert({
          name: data.name,
          description: data.description,
          target_amount: data.target_amount,
          unlock_type: data.unlock_type,
          unlock_date: data.unlock_date,
          creator_id: user.id,
          invite_code: inviteCode,
        })
        .select()
        .single();

      if (roomError) {
        return { success: false, error: roomError.message };
      }

      // Add creator as first member
      const { error: memberError } = await supabase
        .from('room_members')
        .insert({
          room_id: room.id,
          user_id: user.id,
        });

      if (memberError) {
        console.error('Error adding creator as member:', memberError);
      }

      await fetchRooms();
      return { success: true, roomId: room.id };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [fetchRooms]);

  return {
    rooms,
    loading,
    error,
    refetch: fetchRooms,
    joinRoom,
    contribute,
    createRoom,
  };
}
