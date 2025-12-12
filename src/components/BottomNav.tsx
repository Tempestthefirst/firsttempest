import { Home, Users, ArrowLeftRight, Wallet, User } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { motion } from 'framer-motion';

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  ariaLabel: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', path: '/dashboard', ariaLabel: 'Go to home dashboard' },
  { icon: Users, label: 'Rooms', path: '/rooms', ariaLabel: 'View your money rooms' },
  { icon: ArrowLeftRight, label: 'Transfers', path: '/transactions', ariaLabel: 'View transaction history' },
  { icon: Wallet, label: 'Wallet', path: '/wallet', ariaLabel: 'Manage your wallet' },
  { icon: User, label: 'Profile', path: '/profile', ariaLabel: 'View your profile' },
];

export const BottomNav = () => {
  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-2">
        <div className="grid grid-cols-5 gap-1 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className="flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-all duration-200 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              activeClassName="text-primary font-semibold"
              aria-label={item.ariaLabel}
            >
              <item.icon className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};