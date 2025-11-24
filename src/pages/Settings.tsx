import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Settings as SettingsIcon, Bell, Lock, Palette, Database, User } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Settings() {
  const { user, settings, updateSettings, seedDemo, clearData } = useStore();
  const [newName, setNewName] = useState(user?.name || '');
  const [newAvatar, setNewAvatar] = useState(user?.avatar || '');
  const [showClearDialog, setShowClearDialog] = useState(false);

  if (!user) return null;

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
        <BackButton to="/profile" />

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
          <Card className="p-6 mb-4 border-0">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Profile</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={newAvatar}
                  onChange={(e) => setNewAvatar(e.target.value)}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
              <Button onClick={handleUpdateProfile} className="w-full">
                Update Profile
              </Button>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6 mb-4 border-0">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notify-contributions">Contribution Receipts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when contributions are confirmed
                  </p>
                </div>
                <Switch
                  id="notify-contributions"
                  checked={settings.notifyContributions}
                  onCheckedChange={(checked) =>
                    updateSettings({ notifyContributions: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notify-countdowns">Pre-unlock Countdowns</Label>
                  <p className="text-sm text-muted-foreground">
                    Reminders before room unlock
                  </p>
                </div>
                <Switch
                  id="notify-countdowns"
                  checked={settings.notifyCountdowns}
                  onCheckedChange={(checked) =>
                    updateSettings({ notifyCountdowns: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notify-invites">New Room Invites</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new rooms
                  </p>
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
          <Card className="p-6 mb-4 border-0">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Privacy & Security</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="require-pin">Require PIN for Contributions</Label>
                  <p className="text-sm text-muted-foreground">
                    Extra security for money transfers
                  </p>
                </div>
                <Switch
                  id="require-pin"
                  checked={settings.requirePinForContributions}
                  onCheckedChange={(checked) =>
                    updateSettings({ requirePinForContributions: checked })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Appearance */}
          <Card className="p-6 mb-4 border-0">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Appearance</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle dark theme (coming soon)
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => {
                    updateSettings({ darkMode: checked });
                    toast.info('Dark mode coming soon!');
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Demo Controls */}
          <Card className="p-6 border-0 bg-muted/50">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Demo Controls</h2>
            </div>
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={handleSeedDemo}
                className="w-full"
              >
                Load Demo Data
              </Button>
              <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
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
    </div>
  );
}
