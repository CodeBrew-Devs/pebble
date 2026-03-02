import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';

const SETTINGS_SECTIONS = [
  {
    title: 'Income',
    items: [
      { icon: '💵', bg: '#dcfce7', label: 'Monthly Income',  value: '$5,200' },
      { icon: '📅', bg: '#fef9c3', label: 'Pay Frequency',   value: 'Bi-weekly' },
    ],
  },
  {
    title: 'Savings Goals',
    items: [
      { icon: '🛡️', bg: '#d1fae5', label: 'Emergency Fund', value: '$6,000 target' },
      { icon: '✈️', bg: '#ede9fe', label: 'Vacation',        value: '$2,500 target' },
      { icon: '📈', bg: '#e0f2fe', label: 'Investing',       value: '$5,000 target' },
      { icon: '+',  bg: 'var(--color-sage-light)', label: 'Add a goal', value: '', isAdd: true },
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
      { icon: '🔒', bg: '#f1f5f9', label: 'Change Password',      value: '' },
      { icon: '📧', bg: '#f1f5f9', label: 'Email Notifications',  value: 'On' },
    ],
  },
];

export function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'ME';

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
          <p className={styles.profileName}>{user?.name ?? 'Alex Johnson'}</p>
          <p className={styles.profileEmail}>{user?.email ?? 'alex@example.com'}</p>
        </div>
        <button className={styles.editBtn}>Edit</button>
      </div>

      {/* Budget Allocation */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Budget Allocation</p>
        <div className={styles.allocationCard}>
          {(
            [
              { key: 'needs',   label: '🏠 Needs',   color: 'var(--color-needs)',   accentColor: '#f59e0b', defaultVal: 50 },
              { key: 'wants',   label: '🎉 Wants',   color: 'var(--color-wants)',   accentColor: '#a78bfa', defaultVal: 30 },
              { key: 'savings', label: '💰 Savings', color: 'var(--color-savings)', accentColor: '#34d399', defaultVal: 20 },
            ] as const
          ).map(({ key, label, color, accentColor, defaultVal }) => (
            <div key={key} className={styles.sliderRow}>
              <div className={styles.sliderHeader}>
                <span className={styles.sliderLabel}>{label}</span>
                <span className={styles.sliderPct} style={{ color }}>{defaultVal}%</span>
              </div>
              <input
                type="range"
                min={key === 'needs' ? 10 : 5}
                max={key === 'needs' ? 80 : 60}
                defaultValue={defaultVal}
                style={{ width: '100%', accentColor }}
              />
            </div>
          ))}
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
                className={[styles.settingsItem, (item as any).isAdd ? styles.settingsItemAdd : ''].join(' ')}
              >
                <div className={styles.settingsIcon} style={{ background: item.bg }}>
                  {item.icon}
                </div>
                <span className={[styles.settingsLabel, (item as any).isAdd ? styles.settingsLabelAdd : ''].join(' ')}>
                  {item.label}
                </span>
                {item.value && <span className={styles.settingsValue}>{item.value}</span>}
                {!((item as any).isAdd) && <span className={styles.settingsArrow}>›</span>}
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
