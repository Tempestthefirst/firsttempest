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
  const { isEnabled, loading } = useFeatureFlags();

  const navItems = useMemo(() => {
    return allNavItems.filter((item) => {
      if (!item.featureFlag) return true;
      return isEnabled(item.featureFlag);
    });
  }, [isEnabled]);

  const gridCols = navItems.length <= 3 ? 'grid-cols-3' : navItems.length === 4 ? 'grid-cols-4' : 'grid-cols-5';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border shadow-lg"
      role="navigation"
      aria-label="Main navigation"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-w-lg mx-auto px-2">
        <div className={`grid ${gridCols} gap-1 py-2`}>
          {navItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring relative"
              activeClassName="text-primary bg-primary/10 [&>svg]:text-primary"
              aria-label={item.ariaLabel}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-primary"
                    />
                  )}
                  <item.icon 
                    className={`w-5 h-5 transition-transform ${isActive ? 'text-primary scale-110' : ''}`} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    aria-hidden="true" 
                  />
                  <span className={`text-[10px] font-medium transition-all ${isActive ? 'text-primary font-semibold' : ''}`}>
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
