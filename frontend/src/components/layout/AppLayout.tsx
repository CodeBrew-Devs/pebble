import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { to: '/dashboard',    icon: '🏠', label: 'Home' },
  { to: '/transactions', icon: '💳', label: 'Transactions' },
  { to: '/profile',      icon: '👤', label: 'Profile' },
];

export function AppLayout({ children }: AppLayoutProps) {
  useAuth(); // available for future use (e.g. avatar, user name)

  return (
    <div className={styles.layout}>
      {/* Desktop sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          pebble<span>.</span>
        </div>
        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [styles.sidebarItem, isActive ? styles.sidebarItemActive : ''].join(' ')
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        <div className={styles.inner}>{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className={styles.bottomNav}>
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [styles.navItem, isActive ? styles.navItemActive : ''].join(' ')
            }
          >
            <span className={styles.navIcon}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
