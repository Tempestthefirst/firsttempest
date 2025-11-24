import { Home, Wallet, Receipt, Settings as SettingsIcon } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { motion } from 'framer-motion';

export const BottomNav = () => {
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Wallet, label: 'Rooms', path: '/rooms' },
    { icon: Receipt, label: 'History', path: '/transactions' },
    { icon: SettingsIcon, label: 'Settings', path: '/settings' },
  ];

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-4 gap-2 py-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className="flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors text-muted-foreground"
              activeClassName="text-primary bg-primary/10"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};
