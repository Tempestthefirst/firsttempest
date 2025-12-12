import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'topup' | 'room-contribution' | 'room-unlock' | 'transfer' | 'settlement' | 'hourglass-deduction';
  amount: number;
  description: string;
  date: Date;
  roomId?: string;
  toUserId?: string;
  fromUserId?: string;
  status: 'pending' | 'confirmed' | 'refunded';
}

export interface Contribution {
  id: string;
  roomId: string;
  userId: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'refunded';
  timestamp: Date;
}

export interface Notification {
  id: string;
  type: 'contribution' | 'unlock' | 'countdown' | 'invite' | 'dispute' | 'hourglass';
  title: string;
  message: string;
  roomId?: string;
  timestamp: Date;
  read: boolean;
}

export interface MoneyRoom {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  unlockDate?: Date;
  unlockType: 'target' | 'date' | 'both';
  createdBy: string;
  creatorId: string;
  members: string[];
  contributions: Contribution[];
  contributors: { name: string; amount: number; avatar: string }[];
  isUnlocked: boolean;
  status: 'open' | 'unlocked' | 'archived';
  createdAt: Date;
  inviteCode: string;
}

export interface HourGlassPlan {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  endDate: Date;
  recurrence: 'daily' | 'weekly' | 'monthly';
  deductionAmount: number;
  nextDeductionDate: Date;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  createdAt: Date;
}

interface User {
  id: string;
  name: string;
  pin: string;
  balance: number;
  avatar: string;
  virtualAccountNumber?: string;
  virtualAccountBank?: string;
}

interface AppSettings {
  notifyContributions: boolean;
  notifyCountdowns: boolean;
  notifyInvites: boolean;
  requirePinForContributions: boolean;
  darkMode: boolean;
}

interface AppStore {
  user: User | null;
  transactions: Transaction[];
  rooms: MoneyRoom[];
  notifications: Notification[];
  hourGlassPlans: HourGlassPlan[];
  settings: AppSettings;
  isAuthenticated: boolean;
  allUsers: User[];
  
  // Auth actions
  login: (name: string, pin: string) => boolean;
  signup: (name: string, pin: string) => void;
  logout: () => void;
  
  // Balance actions
  updateBalance: (amount: number) => void;
  topUp: (amount: number) => Promise<void>;
  
  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  
  // Transfer actions
  sendMoney: (toUserId: string, amount: number, description: string) => Promise<boolean>;
  
  // Room actions
  createRoom: (room: Omit<MoneyRoom, 'id' | 'currentAmount' | 'contributions' | 'contributors' | 'isUnlocked' | 'createdAt' | 'status' | 'inviteCode' | 'members' | 'creatorId'>) => string;
  joinRoom: (inviteCode: string) => Promise<MoneyRoom | null>;
  contributeToRoom: (roomId: string, amount: number) => Promise<boolean>;
  unlockRoom: (roomId: string) => void;
  checkRoomUnlocks: () => void;
  refundRoom: (roomId: string) => void;
  
  // HourGlass actions
  createHourGlassPlan: (plan: Omit<HourGlassPlan, 'id' | 'userId' | 'currentAmount' | 'status' | 'createdAt' | 'nextDeductionDate'>) => string | null;
  pauseHourGlassPlan: (planId: string) => void;
  resumeHourGlassPlan: (planId: string) => void;
  cancelHourGlassPlan: (planId: string) => void;
  processHourGlassDeductions: () => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  
  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Demo/seed actions
  seedDemo: () => void;
  clearData: () => void;
  
  // Utility
  getUserById: (userId: string) => User | null;
  getRoomByInviteCode: (code: string) => MoneyRoom | null;
}

const generateId = () => Math.random().toString(36).substring(2, 9).toUpperCase();
const generateInviteCode = () => Math.random().toString(36).substring(2, 10).toUpperCase();
const generateVirtualAccount = () => '00' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: null,
      transactions: [],
      rooms: [],
      notifications: [],
      hourGlassPlans: [],
      allUsers: [],
      isAuthenticated: false,
      settings: {
        notifyContributions: true,
        notifyCountdowns: true,
        notifyInvites: true,
        requirePinForContributions: false,
        darkMode: false,
      },

      login: (name: string, pin: string) => {
        const state = get();
        const foundUser = state.allUsers.find(u => u.name === name && u.pin === pin);
        if (foundUser) {
          set({ user: foundUser, isAuthenticated: true });
          return true;
        }
        if (state.user && state.user.name === name && state.user.pin === pin) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      signup: (name: string, pin: string) => {
        const newUser: User = {
          id: generateId(),
          name,
          pin,
          balance: 10000,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          virtualAccountNumber: generateVirtualAccount(),
          virtualAccountBank: 'SplitSpace Bank',
        };
        set((state) => ({
          user: newUser,
          allUsers: [...state.allUsers, newUser],
          isAuthenticated: true,
        }));
      },

      logout: () => {
        set({ isAuthenticated: false });
      },

      updateBalance: (amount: number) => {
        set((state) => ({
          user: state.user ? { ...state.user, balance: state.user.balance + amount } : null,
          allUsers: state.allUsers.map(u => 
            u.id === state.user?.id ? { ...u, balance: u.balance + amount } : u
          ),
        }));
      },

      topUp: async (amount: number) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        get().updateBalance(amount);
        get().addTransaction({
          type: 'topup',
          amount,
          description: `Added ₦${amount.toLocaleString()}`,
          status: 'confirmed',
        });
      },

      sendMoney: async (toUserId: string, amount: number, description: string) => {
        const state = get();
        if (!state.user || state.user.balance < amount) return false;
        
        await new Promise(resolve => setTimeout(resolve, 600));
        
        get().updateBalance(-amount);
        
        set((state) => ({
          allUsers: state.allUsers.map(u =>
            u.id === toUserId ? { ...u, balance: u.balance + amount } : u
          ),
        }));
        
        get().addTransaction({
          type: 'send',
          amount: -amount,
          description: `Sent to ${get().getUserById(toUserId)?.name || 'User'}: ${description}`,
          toUserId,
          status: 'confirmed',
        });
        
        return true;
      },

      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: generateId(),
          date: new Date(),
          status: transaction.status || 'confirmed',
        };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
      },

      createRoom: (room) => {
        const state = get();
        const inviteCode = generateInviteCode();
        const newRoom: MoneyRoom = {
          ...room,
          id: generateId(),
          creatorId: state.user?.id || '',
          currentAmount: 0,
          contributions: [],
          contributors: [],
          members: [state.user?.id || ''],
          isUnlocked: false,
          status: 'open',
          inviteCode,
          createdAt: new Date(),
        };
        set((state) => ({
          rooms: [...state.rooms, newRoom],
        }));
        
        if (state.settings.notifyInvites) {
          get().addNotification({
            type: 'invite',
            title: 'Room Created',
            message: `${room.name} is ready. Share code: ${inviteCode}`,
            roomId: newRoom.id,
          });
        }
        
        return newRoom.id;
      },

      joinRoom: async (inviteCode: string) => {
        const state = get();
        const room = state.rooms.find((r) => r.inviteCode === inviteCode);
        if (!room || !state.user) return null;
        
        await new Promise(resolve => setTimeout(resolve, 400));
        
        if (!room.members.includes(state.user.id)) {
          set((state) => ({
            rooms: state.rooms.map((r) =>
              r.inviteCode === inviteCode
                ? { ...r, members: [...r.members, state.user?.id || ''] }
                : r
            ),
          }));
        }
        
        return get().rooms.find((r) => r.inviteCode === inviteCode) || null;
      },

      contributeToRoom: async (roomId: string, amount: number) => {
        const state = get();
        if (!state.user || state.user.balance < amount) return false;

        await new Promise(resolve => setTimeout(resolve, 600));
        
        const contribution: Contribution = {
          id: generateId(),
          roomId,
          userId: state.user.id,
          amount,
          status: 'confirmed',
          timestamp: new Date(),
        };

        set((state) => ({
          user: state.user ? { ...state.user, balance: state.user.balance - amount } : null,
          allUsers: state.allUsers.map(u => 
            u.id === state.user?.id ? { ...u, balance: u.balance - amount } : u
          ),
          rooms: state.rooms.map((room) =>
            room.id === roomId
              ? {
                  ...room,
                  currentAmount: room.currentAmount + amount,
                  contributions: [...room.contributions, contribution],
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
          description: `Contributed to ${get().rooms.find(r => r.id === roomId)?.name || roomId}`,
          roomId,
          status: 'confirmed',
        });
        
        const room = get().rooms.find(r => r.id === roomId);
        if (state.settings.notifyContributions && room) {
          get().addNotification({
            type: 'contribution',
            title: 'Contribution Confirmed',
            message: `₦${amount.toLocaleString()} added to ${room.name}`,
            roomId,
          });
        }

        get().checkRoomUnlocks();
        return true;
      },

      unlockRoom: (roomId: string) => {
        const state = get();
        const room = state.rooms.find((r) => r.id === roomId);
        if (!room || room.isUnlocked) return;

        const totalAmount = room.currentAmount;
        const creatorId = room.creatorId;

        set((state) => ({
          allUsers: state.allUsers.map(u =>
            u.id === creatorId ? { ...u, balance: u.balance + totalAmount } : u
          ),
          user: state.user?.id === creatorId 
            ? { ...state.user, balance: state.user.balance + totalAmount }
            : state.user,
          rooms: state.rooms.map((r) =>
            r.id === roomId ? { ...r, isUnlocked: true, status: 'unlocked' } : r
          ),
        }));

        get().addTransaction({
          type: 'settlement',
          amount: totalAmount,
          description: `Room "${room.name}" unlocked`,
          roomId,
          status: 'confirmed',
        });
        
        get().addNotification({
          type: 'unlock',
          title: `${room.name} Unlocked!`,
          message: `₦${totalAmount.toLocaleString()} released`,
          roomId,
        });
      },
      
      refundRoom: (roomId: string) => {
        const state = get();
        const room = state.rooms.find((r) => r.id === roomId);
        if (!room) return;

        room.contributions.forEach((contrib) => {
          set((state) => ({
            allUsers: state.allUsers.map(u =>
              u.id === contrib.userId ? { ...u, balance: u.balance + contrib.amount } : u
            ),
            user: state.user?.id === contrib.userId
              ? { ...state.user, balance: state.user.balance + contrib.amount }
              : state.user,
          }));
          
          get().addTransaction({
            type: 'room-unlock',
            amount: contrib.amount,
            description: `Refund from "${room.name}"`,
            roomId,
            status: 'refunded',
          });
        });

        set((state) => ({
          rooms: state.rooms.map((r) =>
            r.id === roomId ? { ...r, status: 'archived' } : r
          ),
        }));
      },

      checkRoomUnlocks: () => {
        const state = get();
        const now = new Date();

        state.rooms.forEach((room) => {
          if (room.isUnlocked || room.status !== 'open') return;

          let shouldUnlock = false;

          if (room.unlockType === 'target' && room.currentAmount >= room.targetAmount) {
            shouldUnlock = true;
          } else if (room.unlockType === 'date' && room.unlockDate && now >= new Date(room.unlockDate)) {
            shouldUnlock = true;
          } else if (
            room.unlockType === 'both' &&
            room.currentAmount >= room.targetAmount &&
            room.unlockDate &&
            now >= new Date(room.unlockDate)
          ) {
            shouldUnlock = true;
          }
          
          if (room.unlockDate && !shouldUnlock && state.settings.notifyCountdowns) {
            const timeLeft = new Date(room.unlockDate).getTime() - now.getTime();
            const hoursLeft = timeLeft / (1000 * 60 * 60);
            
            if (hoursLeft <= 24 && hoursLeft > 23 && !state.notifications.find(n => 
              n.roomId === room.id && n.message.includes('24 hours')
            )) {
              get().addNotification({
                type: 'countdown',
                title: 'Room Unlocking Soon',
                message: `${room.name} unlocks in 24 hours!`,
                roomId: room.id,
              });
            }
          }

          if (shouldUnlock) {
            get().unlockRoom(room.id);
          }
        });
      },

      // HourGlass actions
      createHourGlassPlan: (plan) => {
        const state = get();
        if (!state.user || state.user.balance < plan.deductionAmount) return null;

        const now = new Date();
        let nextDeductionDate = new Date(now);
        
        // Set next deduction based on recurrence
        switch (plan.recurrence) {
          case 'daily':
            nextDeductionDate.setDate(nextDeductionDate.getDate() + 1);
            break;
          case 'weekly':
            nextDeductionDate.setDate(nextDeductionDate.getDate() + 7);
            break;
          case 'monthly':
            nextDeductionDate.setMonth(nextDeductionDate.getMonth() + 1);
            break;
        }

        const newPlan: HourGlassPlan = {
          ...plan,
          id: generateId(),
          userId: state.user.id,
          currentAmount: plan.deductionAmount,
          status: 'active',
          createdAt: now,
          nextDeductionDate,
        };

        // Deduct first amount immediately
        get().updateBalance(-plan.deductionAmount);
        
        get().addTransaction({
          type: 'hourglass-deduction',
          amount: -plan.deductionAmount,
          description: `HourGlass: ${plan.name} - First savings`,
          status: 'confirmed',
        });

        set((state) => ({
          hourGlassPlans: [...state.hourGlassPlans, newPlan],
        }));

        get().addNotification({
          type: 'hourglass',
          title: 'Savings Plan Started',
          message: `${plan.name} - First ₦${plan.deductionAmount.toLocaleString()} saved!`,
        });

        return newPlan.id;
      },

      pauseHourGlassPlan: (planId: string) => {
        set((state) => ({
          hourGlassPlans: state.hourGlassPlans.map(p =>
            p.id === planId ? { ...p, status: 'paused' } : p
          ),
        }));
      },

      resumeHourGlassPlan: (planId: string) => {
        const now = new Date();
        set((state) => ({
          hourGlassPlans: state.hourGlassPlans.map(p => {
            if (p.id !== planId) return p;
            
            let nextDeductionDate = new Date(now);
            switch (p.recurrence) {
              case 'daily':
                nextDeductionDate.setDate(nextDeductionDate.getDate() + 1);
                break;
              case 'weekly':
                nextDeductionDate.setDate(nextDeductionDate.getDate() + 7);
                break;
              case 'monthly':
                nextDeductionDate.setMonth(nextDeductionDate.getMonth() + 1);
                break;
            }
            
            return { ...p, status: 'active', nextDeductionDate };
          }),
        }));
      },

      cancelHourGlassPlan: (planId: string) => {
        const state = get();
        const plan = state.hourGlassPlans.find(p => p.id === planId);
        
        if (plan && plan.currentAmount > 0) {
          // Refund saved amount back to wallet
          get().updateBalance(plan.currentAmount);
          
          get().addTransaction({
            type: 'hourglass-deduction',
            amount: plan.currentAmount,
            description: `HourGlass cancelled: ${plan.name} - Refund`,
            status: 'confirmed',
          });
        }

        set((state) => ({
          hourGlassPlans: state.hourGlassPlans.map(p =>
            p.id === planId ? { ...p, status: 'cancelled' } : p
          ),
        }));
      },

      processHourGlassDeductions: () => {
        const state = get();
        const now = new Date();

        state.hourGlassPlans.forEach((plan) => {
          if (plan.status !== 'active') return;
          if (!state.user) return;

          const nextDeduction = new Date(plan.nextDeductionDate);
          const endDate = new Date(plan.endDate);

          // Check if plan has ended
          if (now >= endDate) {
            set((state) => ({
              hourGlassPlans: state.hourGlassPlans.map(p =>
                p.id === plan.id ? { ...p, status: 'completed' } : p
              ),
            }));
            
            get().addNotification({
              type: 'hourglass',
              title: 'Savings Goal Reached!',
              message: `${plan.name} - ₦${plan.currentAmount.toLocaleString()} saved!`,
            });
            return;
          }

          // Check if deduction is due
          if (now >= nextDeduction) {
            if (state.user.balance >= plan.deductionAmount) {
              get().updateBalance(-plan.deductionAmount);
              
              let newNextDate = new Date(nextDeduction);
              switch (plan.recurrence) {
                case 'daily':
                  newNextDate.setDate(newNextDate.getDate() + 1);
                  break;
                case 'weekly':
                  newNextDate.setDate(newNextDate.getDate() + 7);
                  break;
                case 'monthly':
                  newNextDate.setMonth(newNextDate.getMonth() + 1);
                  break;
              }

              set((state) => ({
                hourGlassPlans: state.hourGlassPlans.map(p =>
                  p.id === plan.id 
                    ? { 
                        ...p, 
                        currentAmount: p.currentAmount + plan.deductionAmount,
                        nextDeductionDate: newNextDate,
                      } 
                    : p
                ),
              }));

              get().addTransaction({
                type: 'hourglass-deduction',
                amount: -plan.deductionAmount,
                description: `HourGlass: ${plan.name}`,
                status: 'confirmed',
              });
            }
          }
        });
      },
      
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: generateId(),
          timestamp: new Date(),
          read: false,
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50),
        }));
      },
      
      markNotificationRead: (notificationId: string) => {
        set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
        }));
      },
      
      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
        }));
      },
      
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },
      
      getUserById: (userId: string) => {
        return get().allUsers.find(u => u.id === userId) || null;
      },
      
      getRoomByInviteCode: (code: string) => {
        return get().rooms.find(r => r.inviteCode === code) || null;
      },
      
      seedDemo: () => {
        const demoUsers: User[] = [
          { id: 'u_you', name: 'You', pin: '1234', balance: 50000, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you', virtualAccountNumber: '0012345678', virtualAccountBank: 'SplitSpace Bank' },
          { id: 'u_alice', name: 'Alice', pin: '0000', balance: 5000, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice', virtualAccountNumber: '0023456789', virtualAccountBank: 'SplitSpace Bank' },
          { id: 'u_bob', name: 'Bob', pin: '0000', balance: 7500, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob', virtualAccountNumber: '0034567890', virtualAccountBank: 'SplitSpace Bank' },
          { id: 'u_charlie', name: 'Charlie', pin: '0000', balance: 3000, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie', virtualAccountNumber: '0045678901', virtualAccountBank: 'SplitSpace Bank' },
          { id: 'u_diana', name: 'Diana', pin: '0000', balance: 12000, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana', virtualAccountNumber: '0056789012', virtualAccountBank: 'SplitSpace Bank' },
          { id: 'u_evan', name: 'Evan', pin: '0000', balance: 8000, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=evan', virtualAccountNumber: '0067890123', virtualAccountBank: 'SplitSpace Bank' },
        ];
        
        const now = new Date();
        const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        const demoRooms: MoneyRoom[] = [
          {
            id: 'room_a',
            name: 'Weekend Trip Fund',
            targetAmount: 30000,
            currentAmount: 18500,
            unlockType: 'target',
            createdBy: 'Alice',
            creatorId: 'u_alice',
            members: ['u_alice', 'u_you', 'u_bob'],
            contributions: [
              { id: 'c1', roomId: 'room_a', userId: 'u_alice', amount: 10000, status: 'confirmed', timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000) },
              { id: 'c2', roomId: 'room_a', userId: 'u_you', amount: 5000, status: 'confirmed', timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
              { id: 'c3', roomId: 'room_a', userId: 'u_bob', amount: 3500, status: 'confirmed', timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000) },
            ],
            contributors: [
              { name: 'Alice', amount: 10000, avatar: demoUsers[1].avatar },
              { name: 'You', amount: 5000, avatar: demoUsers[0].avatar },
              { name: 'Bob', amount: 3500, avatar: demoUsers[2].avatar },
            ],
            isUnlocked: false,
            status: 'open',
            inviteCode: 'WEEKEND1',
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'room_b',
            name: 'Birthday Gift Pool',
            targetAmount: 15000,
            currentAmount: 8000,
            unlockDate: twoHoursLater,
            unlockType: 'date',
            createdBy: 'Charlie',
            creatorId: 'u_charlie',
            members: ['u_charlie', 'u_diana', 'u_you'],
            contributions: [
              { id: 'c4', roomId: 'room_b', userId: 'u_charlie', amount: 5000, status: 'confirmed', timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000) },
              { id: 'c5', roomId: 'room_b', userId: 'u_diana', amount: 3000, status: 'confirmed', timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000) },
            ],
            contributors: [
              { name: 'Charlie', amount: 5000, avatar: demoUsers[3].avatar },
              { name: 'Diana', amount: 3000, avatar: demoUsers[4].avatar },
            ],
            isUnlocked: false,
            status: 'open',
            inviteCode: 'BDAY2025',
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'room_c',
            name: 'Movie Night',
            targetAmount: 5000,
            currentAmount: 5000,
            unlockDate: yesterday,
            unlockType: 'target',
            createdBy: 'Evan',
            creatorId: 'u_evan',
            members: ['u_evan', 'u_you', 'u_alice', 'u_bob'],
            contributions: [
              { id: 'c6', roomId: 'room_c', userId: 'u_evan', amount: 2000, status: 'confirmed', timestamp: yesterday },
              { id: 'c7', roomId: 'room_c', userId: 'u_alice', amount: 1500, status: 'confirmed', timestamp: yesterday },
              { id: 'c8', roomId: 'room_c', userId: 'u_bob', amount: 1500, status: 'confirmed', timestamp: yesterday },
            ],
            contributors: [
              { name: 'Evan', amount: 2000, avatar: demoUsers[5].avatar },
              { name: 'Alice', amount: 1500, avatar: demoUsers[1].avatar },
              { name: 'Bob', amount: 1500, avatar: demoUsers[2].avatar },
            ],
            isUnlocked: true,
            status: 'unlocked',
            inviteCode: 'MOVIE123',
            createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        ];
        
        const demoTransactions: Transaction[] = [
          { id: 't1', type: 'topup', amount: 5000, description: 'Added ₦5,000', date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), status: 'confirmed' },
          { id: 't2', type: 'send', amount: -1000, description: 'Sent to Bob: Coffee', date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000), toUserId: 'u_bob', status: 'confirmed' },
          { id: 't3', type: 'room-contribution', amount: -5000, description: 'Contributed to Weekend Trip Fund', date: new Date(now.getTime() - 2 * 60 * 60 * 1000), roomId: 'room_a', status: 'confirmed' },
          { id: 't4', type: 'receive', amount: 2500, description: 'Received from Alice', date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), fromUserId: 'u_alice', status: 'confirmed' },
        ];

        const demoHourGlassPlans: HourGlassPlan[] = [
          {
            id: 'hg_1',
            userId: 'u_you',
            name: 'Emergency Fund',
            targetAmount: 100000,
            currentAmount: 15000,
            endDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
            recurrence: 'weekly',
            deductionAmount: 5000,
            nextDeductionDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            status: 'active',
            createdAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
          },
        ];
        
        set({
          allUsers: demoUsers,
          user: demoUsers[0],
          rooms: demoRooms,
          transactions: demoTransactions,
          hourGlassPlans: demoHourGlassPlans,
          isAuthenticated: true,
          notifications: [
            {
              id: 'n1',
              type: 'contribution',
              title: 'Contribution Confirmed',
              message: '₦5,000 added to Weekend Trip Fund',
              roomId: 'room_a',
              timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
              read: false,
            },
            {
              id: 'n2',
              type: 'countdown',
              title: 'Room Unlocking Soon',
              message: 'Birthday Gift Pool unlocks in 2 hours!',
              roomId: 'room_b',
              timestamp: new Date(now.getTime() - 30 * 60 * 1000),
              read: false,
            },
            {
              id: 'n3',
              type: 'hourglass',
              title: 'Weekly Savings',
              message: 'Emergency Fund - ₦5,000 saved automatically',
              timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
              read: true,
            },
          ],
        });
      },
      
      clearData: () => {
        set({
          user: null,
          allUsers: [],
          rooms: [],
          transactions: [],
          notifications: [],
          hourGlassPlans: [],
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'splitspace:v1',
    }
  )
);
