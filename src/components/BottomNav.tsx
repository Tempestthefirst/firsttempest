import { Home, Hourglass, Users, ArrowLeftRight, User } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useMemo } from 'react';

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  ariaLabel: string;
  featureFlag?: string;
}

const allNavItems: NavItem[] = [
  { icon: Home, label: 'Home', path: '/dashboard', ariaLabel: 'Go to home dashboard' },
  { icon: Hourglass, label: 'HourGlass', path: '/hourglass', ariaLabel: 'View your savings plans', featureFlag: 'hourglass' },
  { icon: Users, label: 'Rooms', path: '/rooms', ariaLabel: 'View your money rooms', featureFlag: 'money_rooms' },
  { icon: ArrowLeftRight, label: 'Transfers', path: '/transactions', ariaLabel: 'View transaction history' },
  { icon: User, label: 'Profile', path: '/profile', ariaLabel: 'View your profile' },
];

export const BottomNav = () => {
  const { flags, loading } = useFeatureFlags();

  const navItems = useMemo(() => {
    return allNavItems.filter((item) => {
      if (!item.featureFlag) return true;
      if (item.featureFlag === 'hourglass') return flags.hourglass;
      if (item.featureFlag === 'money_rooms') return flags.money_rooms;
      return true;
    });
  }, [flags]);

  const gridCols = navItems.length <= 3 ? 'grid-cols-3' : navItems.length === 4 ? 'grid-cols-4' : 'grid-cols-5';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border"
      role="navigation"
      aria-label="Main navigation"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-w-lg mx-auto px-2">
        <div className={`grid ${gridCols} gap-1 py-1`}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg transition-colors duration-150 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring relative"
              activeClassName="text-success [&>svg]:text-success"
              aria-label={item.ariaLabel}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-success"
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
    </nav>
  );
};
