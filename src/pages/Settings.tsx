import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Settings as SettingsIcon, Bell, Lock, Palette, Database, User, LogOut, Info, Gauge, Trash2, Shield, Camera } from 'lucide-react';
import { ActivityLogSection } from '@/components/ActivityLogSection';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Settings() {
  const { settings, updateSettings, seedDemo, clearData, logout } = useStore();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isDevMode] = useState(() => {
    return window.location.hostname === 'localhost' || 
           window.location.hostname.includes('lovable.app') ||
           window.location.hostname.includes('lovableproject.com');
  });

  // Apply dark mode on mount and when setting changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    clearData();
    toast.success('Logged out successfully');
    navigate('/auth/login');
  };

  const handleSeedDemo = async () => {
    try {
      seedDemo();
      toast.success('Demo data loaded! Check your dashboard.');
    } catch (error) {
      toast.error('Failed to load demo data');
    }
  };

  const handleClearData = () => {
    clearData();
    setShowClearDialog(false);
    toast.success('All data cleared');
    window.location.href = '/auth/login';
  };

  const handleDarkModeToggle = (checked: boolean) => {
    updateSettings({ darkMode: checked });
    document.documentElement.classList.toggle('dark', checked);
    toast.success(checked ? 'Dark mode enabled' : 'Light mode enabled');
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <BackButton fallback="/dashboard" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your preferences</p>
            </div>
          </div>

          {/* Profile Settings */}
          <Card className="p-6 mb-4 border-0 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Profile</h2>
            </div>
            
            {/* Profile Picture */}
            <motion.div 
              className="flex flex-col items-center mb-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  {profile?.identity_photo_url ? (
                    <AvatarImage 
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/identity-photos/${profile.identity_photo_url}`} 
                      alt={profile.full_name}
                    />
                  ) : null}
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <motion.div 
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Camera className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              </div>
              <p className="mt-3 text-lg font-semibold">{profile?.full_name || 'User'}</p>
              <p className="text-sm text-muted-foreground">{profile?.phone_number}</p>
            </motion.div>

            <div className="space-y-3">
              <motion.div 
                className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-all cursor-pointer"
                whileHover={{ x: 4 }}
              >
                <div>
                  <p className="font-semibold">Name</p>
                  <p className="text-sm text-muted-foreground">{profile?.full_name || 'Not set'}</p>
                </div>
              </motion.div>
              <motion.div 
                className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-all cursor-pointer"
                whileHover={{ x: 4 }}
              >
                <div>
                  <p className="font-semibold">Phone</p>
                  <p className="text-sm text-muted-foreground">{profile?.phone_number || 'N/A'}</p>
                </div>
              </motion.div>
              <motion.div 
                className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-all cursor-pointer"
                whileHover={{ x: 4 }}
              >
                <div>
                  <p className="font-semibold">Verification Status</p>
                  <p className={`text-sm ${profile?.is_verified ? 'text-green-600' : 'text-amber-600'}`}>
                    {profile?.is_verified ? 'Verified' : 'Pending Verification'}
                  </p>
                </div>
              </motion.div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6 mb-4 border-0 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Notifications</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-semibold">Contribution Receipts</p>
                  <p className="text-sm text-muted-foreground">Get notified when confirmed</p>
                </div>
                <Switch
                  id="notify-contributions"
                  checked={settings.notifyContributions}
                  onCheckedChange={(checked) =>
                    updateSettings({ notifyContributions: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-semibold">Pre-unlock Countdowns</p>
                  <p className="text-sm text-muted-foreground">Reminders before unlock</p>
                </div>
                <Switch
                  id="notify-countdowns"
                  checked={settings.notifyCountdowns}
                  onCheckedChange={(checked) =>
                    updateSettings({ notifyCountdowns: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-semibold">New Room Invites</p>
                  <p className="text-sm text-muted-foreground">Get notified about rooms</p>
                </div>
                <Switch
                  id="notify-invites"
                  checked={settings.notifyInvites}
                  onCheckedChange={(checked) =>
                    updateSettings({ notifyInvites: checked })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Privacy & Security */}
          <Card className="p-6 mb-4 border-0 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Security</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-semibold">PIN Protection</p>
                  <p className="text-sm text-muted-foreground">Require PIN for contributions</p>
                </div>
                <Switch
                  id="require-pin"
                  checked={settings.requirePinForContributions}
                  onCheckedChange={(checked) =>
                    updateSettings({ requirePinForContributions: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer">
                <div>
                  <p className="font-semibold">Change PIN</p>
                  <p className="text-sm text-muted-foreground">Update security PIN</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Appearance */}
          <Card className="p-6 mb-4 border-0 shadow-sm" role="region" aria-label="Appearance settings">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-bold">Appearance</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <label htmlFor="dark-mode" className="flex-1 cursor-pointer">
                  <p className="font-semibold">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
                </label>
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  onCheckedChange={handleDarkModeToggle}
                  aria-label="Toggle dark mode"
                />
              </div>
            </div>
          </Card>

          {/* Limits */}
          <Card className="p-6 mb-4 border-0 shadow-sm" role="region" aria-label="Transaction limits">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="w-5 h-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-bold">Limits</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-semibold">Daily Transfer Limit</p>
                  <p className="text-sm text-muted-foreground">₦500,000 per day</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-semibold">Single Transaction Limit</p>
                  <p className="text-sm text-muted-foreground">₦100,000 per transaction</p>
                </div>
              </div>
            </div>
          </Card>

          {/* About */}
          <Card className="p-6 mb-4 border-0 shadow-sm" role="region" aria-label="About SplitSpace">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-bold">About</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-semibold">App Version</p>
                  <p className="text-sm text-muted-foreground">1.0.0</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-semibold">Terms of Service</p>
                  <p className="text-sm text-muted-foreground">Read our terms</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-semibold">Privacy Policy</p>
                  <p className="text-sm text-muted-foreground">How we handle your data</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Activity Log */}
          <div className="mb-4">
            <ActivityLogSection />
          </div>

          {/* Account Actions */}
          <Card className="p-6 mb-4 border-0 shadow-sm" role="region" aria-label="Account actions">
            <div className="flex items-center gap-2 mb-4">
              <LogOut className="w-5 h-5 text-destructive" aria-hidden="true" />
              <h2 className="text-lg font-bold">Account</h2>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="w-full h-12 font-semibold"
              aria-label="Logout from your account"
            >
              <LogOut className="w-5 h-5 mr-2" aria-hidden="true" />
              Logout
            </Button>
          </Card>

          {/* Dev Controls - Only show in dev mode */}
          {isDevMode && (
            <Card className="p-6 border-0 bg-muted/30" role="region" aria-label="Developer controls">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-primary" aria-hidden="true" />
                <h2 className="text-lg font-bold">Dev Controls</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-4">These controls are only visible in development</p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={handleSeedDemo}
                  className="w-full h-12 font-semibold"
                  aria-label="Load demo data for testing"
                >
                  <Database className="w-4 h-4 mr-2" aria-hidden="true" />
                  Seed Demo Data
                </Button>
                <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full h-12 font-semibold" aria-label="Clear all application data">
                      <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                      Clear All Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Clear All Data?</DialogTitle>
                      <DialogDescription>
                        This will permanently delete all rooms, transactions, and user data.
                        This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 justify-end mt-4">
                      <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleClearData}>
                        Clear Data
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          )}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
