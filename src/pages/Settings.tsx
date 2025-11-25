import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Settings as SettingsIcon, Bell, Lock, Palette, Database, User, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
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
  const { user, settings, updateSettings, seedDemo, clearData, logout } = useStore();
  const navigate = useNavigate();
  const [newName, setNewName] = useState(user?.name || '');
  const [newAvatar, setNewAvatar] = useState(user?.avatar || '');
  const [showClearDialog, setShowClearDialog] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleSeedDemo = () => {
    seedDemo();
    toast.success('Demo data loaded! Check your dashboard.');
  };

  const handleClearData = () => {
    clearData();
    setShowClearDialog(false);
    toast.success('All data cleared');
    window.location.href = '/';
  };

  const handleUpdateProfile = () => {
    // In a real app, this would update the user profile
    toast.success('Profile updated (demo mode)');
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <BackButton to="/" />

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
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer">
                <div>
                  <p className="font-semibold">Name</p>
                  <p className="text-sm text-muted-foreground">{user?.name || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer">
                <div>
                  <p className="font-semibold">Account ID</p>
                  <p className="text-sm text-muted-foreground">{user?.id || 'N/A'}</p>
                </div>
              </div>
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
          <Card className="p-6 mb-4 border-0 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Appearance</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-semibold">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Toggle theme</p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => {
                    updateSettings({ darkMode: checked });
                    document.documentElement.classList.toggle('dark', checked);
                    toast.success(checked ? 'Dark mode enabled' : 'Light mode enabled');
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Account Actions */}
          <Card className="p-6 mb-4 border-0 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <LogOut className="w-5 h-5 text-destructive" />
              <h2 className="text-lg font-bold">Account</h2>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="w-full h-12 font-semibold"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </Card>

          {/* Demo Controls */}
          <Card className="p-6 border-0 bg-muted/30">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Demo Controls</h2>
            </div>
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={handleSeedDemo}
                className="w-full h-12 font-semibold"
              >
                Load Demo Data
              </Button>
              <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full h-12 font-semibold">
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
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
