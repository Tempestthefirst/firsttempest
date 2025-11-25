import { Home, Users, ArrowLeftRight, Wallet, User } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { motion } from 'framer-motion';

export const BottomNav = () => {
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Users, label: 'Rooms', path: '/rooms' },
    { icon: ArrowLeftRight, label: 'Transfers', path: '/transactions' },
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-2">
        <div className="grid grid-cols-5 gap-1 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className="flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-all duration-200 text-muted-foreground"
              activeClassName="text-primary font-semibold"
            >
              <item.icon className="w-5 h-5" strokeWidth={2.5} />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};
