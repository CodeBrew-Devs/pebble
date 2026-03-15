import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';

// Type for individual settings list items — isAdd flags the special "Add a goal" row
interface SettingsItem {
  icon: string;
  bg: string;
  label: string;
  value: string;
  isAdd?: boolean;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    title: 'Income',
    items: [
      { icon: '💵', bg: '#dcfce7', label: 'Monthly Income', value: '$5,200' },
      { icon: '📅', bg: '#fef9c3', label: 'Pay Frequency', value: 'Bi-weekly' },
    ],
  },
  {
    title: 'Savings Goals',
    items: [
      { icon: '🛡️', bg: '#d1fae5', label: 'Emergency Fund', value: '$6,000 target' },
      { icon: '✈️', bg: '#ede9fe', label: 'Vacation', value: '$2,500 target' },
      { icon: '📈', bg: '#e0f2fe', label: 'Investing', value: '$5,000 target' },
      { icon: '+', bg: 'var(--color-sage-light)', label: 'Add a goal', value: '', isAdd: true },
    ],
  },
  {
    title: 'Transaction Tags',
    items: [
      { icon: '🏷️', bg: '#fef3c7', label: 'Manage Tags', value: '6 tags' },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: '🔒', bg: '#f1f5f9', label: 'Change Password', value: '' },
      { icon: '📧', bg: '#f1f5f9', label: 'Email Notifications', value: 'On' },
    ],
  },
];

export function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  //Controlled state for budget allocation sliders
  const [needs, setNeeds] = useState(50); //initial value of 50
  const [wants, setWants] = useState(30); //initial value of 30

  //Savings is always derived-never stored separately
  const savings: number = 100 - needs - wants;

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : 'ME';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Profile &amp; Settings</h1>

      {/* Profile card */}
      <div className={styles.profileCard}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.profileInfo}>
          <p className={styles.profileName}>{user ? `${user.firstName} ${user.lastName}` : 'Alex Johnson'}</p>
          <p className={styles.profileEmail}>{user?.email ?? 'alex@example.com'}</p>
        </div>
        <button className={styles.editBtn}>Edit</button>
      </div>

      {/* Budget Allocation */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Budget Allocation</p>
        <div className={styles.allocationCard}>

          {/* Needs slider — user controls freely between 10% and 80% */}
          <div className={styles.sliderRow}>
            <div className={styles.sliderHeader}>
              <span className={styles.sliderLabel}>🏠 Needs</span>
              <span className={styles.sliderPct} style={{ color: 'var(--color-needs)' }}>{needs}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={80}
              value={needs}
              onChange={(e) => {
                const newNeeds = Number(e.target.value);
                setNeeds(newNeeds);
                if (wants > 95 - newNeeds) setWants(95 - newNeeds);
              }}
              style={{ width: '100%', accentColor: '#f59e0b' }}
            />
          </div>

          {/* Wants slider — max is dynamic so savings never drops below 5% */}
          <div className={styles.sliderRow}>
            <div className={styles.sliderHeader}>
              <span className={styles.sliderLabel}>🎉 Wants</span>
              <span className={styles.sliderPct} style={{ color: 'var(--color-wants)' }}>{wants}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={95 - needs}
              value={wants}
              onChange={(e) => setWants(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#a78bfa' }}
            />
          </div>

          {/* Savings — read-only, always computed as 100 - needs - wants */}
          <div className={styles.sliderRow}>
            <div className={styles.sliderHeader}>
              <span className={styles.sliderLabel}>💰 Savings</span>
              <span className={styles.sliderPct} style={{ color: 'var(--color-savings)' }}>{savings}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={savings}
              readOnly
              style={{ width: '100%', accentColor: '#34d399', opacity: 0.5, cursor: 'not-allowed' }}
            />
          </div>

        </div>

      </div>

      {/* Settings sections */}
      {SETTINGS_SECTIONS.map((section) => (
        <div key={section.title} className={styles.section}>
          <p className={styles.sectionTitle}>{section.title}</p>
          <div className={styles.settingsList}>
            {section.items.map((item) => (
              <div
                key={item.label}
                className={[styles.settingsItem, item.isAdd ? styles.settingsItemAdd : ''].join(' ')}
              >
                <div className={styles.settingsIcon} style={{ background: item.bg }}>
                  {item.icon}
                </div>
                {/* Use isAdd to conditionally apply the add-row label style */}
                <span className={[styles.settingsLabel, item.isAdd ? styles.settingsLabelAdd : ''].join(' ')}>
                  {item.label}
                </span>
                {item.value && <span className={styles.settingsValue}>{item.value}</span>}
                {!item.isAdd && <span className={styles.settingsArrow}>›</span>}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Sign out */}
      <div className={styles.section}>
        <div className={styles.settingsList}>
          <button className={[styles.settingsItem, styles.signOutItem].join(' ')} onClick={handleLogout}>
            <div className={styles.settingsIcon} style={{ background: '#fee2e2' }}>🚪</div>
            <span className={styles.signOutLabel}>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
