import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { House, CreditCard, CircleUserRound } from 'lucide-react'; // Lucide icons for nav items
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

// Describes the shape of each nav item — icon is a component reference, not a rendered element
type NavItem = {
  to: string;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
}

// Single source of truth for nav links — shared by both sidebar and bottom nav
const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', icon: House, label: 'Home' },
  { to: '/transactions', icon: CreditCard, label: 'Transactions' },
  { to: '/profile', icon: CircleUserRound, label: 'Profile' },
];

export function AppLayout({ children }: AppLayoutProps) {
  useAuth(); // available for future use (e.g. avatar, user name)

  return (
    <div className={styles.layout}>
      {/* Desktop sidebar — hidden on mobile, shown at 768px+ via CSS */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          pebble<span>.</span>
        </div>
        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map(({ to, icon, label }) => {
            const Icon = icon; // capitalize so React treats it as a component, not a DOM tag
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [styles.sidebarItem, isActive ? styles.sidebarItemActive : ''].join(' ')
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main content — fills remaining space beside the sidebar on desktop */}
      <main className={styles.main}>
        <div className={styles.inner}>{children}</div>
      </main>

      {/* Mobile bottom nav — fixed to viewport bottom, hidden on desktop via CSS */}
      <nav className={styles.bottomNav}>
        {NAV_ITEMS.map(({ to, icon, label }) => {
          const Icon = icon; // capitalize so React treats it as a component, not a DOM tag
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [styles.navItem, isActive ? styles.navItemActive : ''].join(' ')
              }
            >
              <Icon size={22} />
              {label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
