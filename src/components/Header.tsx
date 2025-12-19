import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationCenter } from '@/components/NotificationCenter';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { profile, loading } = useProfile();
  const navigate = useNavigate();

  // Show minimal header while loading
  if (loading || !profile) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border h-14" />
    );
  }

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`;
  const initials = profile.full_name?.[0]?.toUpperCase() || 'U';

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <motion.div 
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/profile')}
            aria-label="Go to profile"
          >
            <Avatar className="w-9 h-9 ring-2 ring-border">
              <AvatarImage src={avatarUrl} alt={profile.full_name} />
              <AvatarFallback className="bg-foreground text-background text-sm font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-muted-foreground">Welcome back,</p>
              <p className="text-sm font-semibold">{profile.full_name}</p>
            </div>
          </motion.div>

          <NotificationCenter />
        </div>
      </div>
    </motion.header>
  );
};
