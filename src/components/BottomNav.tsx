import { Home, Hourglass, Users, ArrowLeftRight, User } from 'lucide-react';
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
  { icon: Hourglass, label: 'HourGlass', path: '/hourglass', ariaLabel: 'View your savings plans' },
  { icon: Users, label: 'Rooms', path: '/rooms', ariaLabel: 'View your money rooms' },
  { icon: ArrowLeftRight, label: 'Transfers', path: '/transactions', ariaLabel: 'View transaction history' },
  { icon: User, label: 'Profile', path: '/profile', ariaLabel: 'View your profile' },
];

export const BottomNav = () => {
  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-lg mx-auto px-2">
        <div className="grid grid-cols-5 gap-1 py-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 relative"
              activeClassName="text-success [&>svg]:text-success"
              aria-label={item.ariaLabel}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-success"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <item.icon 
                    className={`w-5 h-5 ${isActive ? 'text-success' : ''}`} 
                    strokeWidth={2} 
                    aria-hidden="true" 
                  />
                  <span className={`text-[10px] font-medium ${isActive ? 'text-success' : ''}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};
