import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'topup' | 'room-contribution' | 'room-unlock';
  amount: number;
  description: string;
  date: Date;
  roomId?: string;
}

export interface MoneyRoom {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  unlockDate?: Date;
  unlockType: 'target' | 'date' | 'both';
  createdBy: string;
  contributors: { name: string; amount: number; avatar: string }[];
  isUnlocked: boolean;
  createdAt: Date;
}

interface User {
  name: string;
  pin: string;
  balance: number;
  avatar: string;
}

interface AppStore {
  user: User | null;
  transactions: Transaction[];
  rooms: MoneyRoom[];
  isAuthenticated: boolean;
  
  // Auth actions
  login: (name: string, pin: string) => boolean;
  signup: (name: string, pin: string) => void;
  logout: () => void;
  
  // Balance actions
  updateBalance: (amount: number) => void;
  
  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  
  // Room actions
  createRoom: (room: Omit<MoneyRoom, 'id' | 'currentAmount' | 'contributors' | 'isUnlocked' | 'createdAt'>) => string;
  joinRoom: (roomId: string) => MoneyRoom | null;
  contributeToRoom: (roomId: string, amount: number) => void;
  unlockRoom: (roomId: string) => void;
  checkRoomUnlocks: () => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: null,
      transactions: [],
      rooms: [],
      isAuthenticated: false,

      login: (name: string, pin: string) => {
        const state = get();
        if (state.user && state.user.name === name && state.user.pin === pin) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      signup: (name: string, pin: string) => {
        set({
          user: {
            name,
            pin,
            balance: 1000, // Starting balance
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          },
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({ isAuthenticated: false });
      },

      updateBalance: (amount: number) => {
        set((state) => ({
          user: state.user ? { ...state.user, balance: state.user.balance + amount } : null,
        }));
      },

      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: Math.random().toString(36).substring(7),
          date: new Date(),
        };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
      },

      createRoom: (room) => {
        const newRoom: MoneyRoom = {
          ...room,
          id: Math.random().toString(36).substring(7).toUpperCase(),
          currentAmount: 0,
          contributors: [],
          isUnlocked: false,
          createdAt: new Date(),
        };
        set((state) => ({
          rooms: [...state.rooms, newRoom],
        }));
        return newRoom.id;
      },

      joinRoom: (roomId: string) => {
        const state = get();
        const room = state.rooms.find((r) => r.id === roomId);
        return room || null;
      },

      contributeToRoom: (roomId: string, amount: number) => {
        const state = get();
        if (!state.user || state.user.balance < amount) return;

        set((state) => ({
          user: state.user ? { ...state.user, balance: state.user.balance - amount } : null,
          rooms: state.rooms.map((room) =>
            room.id === roomId
              ? {
                  ...room,
                  currentAmount: room.currentAmount + amount,
                  contributors: [
                    ...room.contributors.filter((c) => c.name !== state.user?.name),
                    {
                      name: state.user?.name || '',
                      amount:
                        (room.contributors.find((c) => c.name === state.user?.name)?.amount || 0) +
                        amount,
                      avatar: state.user?.avatar || '',
                    },
                  ],
                }
              : room
          ),
        }));

        get().addTransaction({
          type: 'room-contribution',
          amount: -amount,
          description: `Contributed to room ${roomId}`,
          roomId,
        });

        get().checkRoomUnlocks();
      },

      unlockRoom: (roomId: string) => {
        const state = get();
        const room = state.rooms.find((r) => r.id === roomId);
        if (!room || room.isUnlocked) return;

        const userContribution =
          room.contributors.find((c) => c.name === state.user?.name)?.amount || 0;

        set((state) => ({
          user: state.user
            ? { ...state.user, balance: state.user.balance + userContribution }
            : null,
          rooms: state.rooms.map((r) =>
            r.id === roomId ? { ...r, isUnlocked: true } : r
          ),
        }));

        if (userContribution > 0) {
          get().addTransaction({
            type: 'room-unlock',
            amount: userContribution,
            description: `Room "${room.name}" unlocked`,
            roomId,
          });
        }
      },

      checkRoomUnlocks: () => {
        const state = get();
        const now = new Date();

        state.rooms.forEach((room) => {
          if (room.isUnlocked) return;

          let shouldUnlock = false;

          if (room.unlockType === 'target' && room.currentAmount >= room.targetAmount) {
            shouldUnlock = true;
          } else if (room.unlockType === 'date' && room.unlockDate && now >= room.unlockDate) {
            shouldUnlock = true;
          } else if (
            room.unlockType === 'both' &&
            room.currentAmount >= room.targetAmount &&
            room.unlockDate &&
            now >= room.unlockDate
          ) {
            shouldUnlock = true;
          }

          if (shouldUnlock) {
            get().unlockRoom(room.id);
          }
        });
      },
    }),
    {
      name: 'splitspace-storage',
    }
  )
);
