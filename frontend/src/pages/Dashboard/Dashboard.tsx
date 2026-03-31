import { useAuth } from '../../context/AuthContext';
import type { Goal, BudgetSummary } from '../../types';
import styles from './Dashboard.module.css';

// Mock data — replace with TanStack Query hooks once API is ready
const GOALS: Goal[] = [
  { id: '1', label: 'Emergency Fund', icon: '🛡️', current: 3240, target: 6000, color: 'linear-gradient(135deg,#059669,#34d399)' },
  { id: '2', label: 'Vacation', icon: '✈️', current: 890, target: 2500, color: 'linear-gradient(135deg,#7c3aed,#a78bfa)' },
  { id: '3', label: 'Investing', icon: '📈', current: 1150, target: 5000, color: 'linear-gradient(135deg,#0ea5e9,#38bdf8)' },
];

const NEEDS = [
  { icon: '🏠', bg: '#fef9c3', name: 'Rent', sub: 'Due Mar 1', amount: 1400, pct: 53 },
  { icon: '🚗', bg: '#dcfce7', name: 'Car Payment', sub: 'Auto-pay', amount: 430, pct: 17 },
  { icon: '🛡️', bg: '#fce7f3', name: 'Insurance', sub: 'Health + Auto', amount: 310, pct: 12 },
  { icon: '🛒', bg: '#dbeafe', name: 'Groceries', sub: 'This month so far', amount: 460, pct: 18 },
];

const WANTS = [
  { icon: '🍕', bg: '#ede9fe', name: 'Dining Out', sub: '9 transactions', amount: 234, pct: 15 },
  { icon: '🎬', bg: '#fef3c7', name: 'Entertainment', sub: '3 transactions', amount: 89, pct: 6 },
  { icon: '📺', bg: '#ecfdf5', name: 'Subscriptions', sub: 'Netflix, Spotify…', amount: 47, pct: 3 },
];

// TODO: replace with TanStack Query hook once GET /user returns budget fields
const BUDGET: BudgetSummary = {
  incomeAmount: 5200,
  incomeFrequency: 'monthly',
  budgetNeeds: 50,
  budgetWants: 30,
  budgetSavings: 20,
};


function GoalProgressCard({ goal }: { goal: Goal }) {
  const pct = Math.round((goal.current / goal.target) * 100);
  return (
    <div className={styles.goalCard} style={{ background: goal.color }}>
      <span className={styles.goalIcon}>{goal.icon}</span>
      <span className={styles.goalLabel}>{goal.label}</span>
      <span className={styles.goalAmount}>${goal.current.toLocaleString()}</span>
      <span className={styles.goalTarget}>of ${goal.target.toLocaleString()} goal</span>
      <div className={styles.goalBar}>
        <div className={styles.goalFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.goalPct}>{pct}% — keep going!</span>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.firstName ?? 'there';

  const needsAmount = BUDGET.incomeAmount * (BUDGET.budgetNeeds / 100);
  const wantsAmount = BUDGET.incomeAmount * (BUDGET.budgetWants / 100);
  const savingsAmount = BUDGET.incomeAmount * (BUDGET.budgetSavings / 100);


  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>
            Good morning, <span>{firstName}</span> 👋
          </h1>
          <p className={styles.month}>March 2026</p>
        </div>
      </div>

      {/* Hero card — TODO: replace savingsAmount and incomeAmount with live data from API once GET /user returns budget fields */}
      <div className={styles.heroCard}>
        <p className={styles.heroLabel}>Saved this month</p>
        <p className={styles.heroAmount}>
          ${savingsAmount.toLocaleString()}
        </p>
        <p className={styles.heroSub}>of your ${BUDGET.incomeAmount.toLocaleString()} monthly income</p>
        {/* TODO: replace hardcoded trend with API-derived comparison once available */}
        <span className={styles.heroBadge}>↑ 12% vs last month</span>
      </div>


      {/* Budget split */}
      <div className={styles.card}>
        <div className={styles.splitHeader}>
          <span className={styles.splitTitle}>Monthly Budget Split</span>
          <span className={styles.splitTotal}>$5,200 / mo</span>
        </div>
        <div className={styles.splitBar}>
          <div className={styles.splitNeeds} style={{ width: '50%' }} />
          <div className={styles.splitWants} style={{ width: '30%' }} />
          <div className={styles.splitSavings} style={{ width: '20%' }} />
        </div>
        <div className={styles.splitLegend}>
          {[
            { color: 'var(--color-needs)', val: '$2,600', label: 'Needs · 50%' },
            { color: 'var(--color-wants)', val: '$1,560', label: 'Wants · 30%' },
            { color: 'var(--color-savings)', val: '$1,040', label: 'Savings · 20%' },
          ].map(({ color, val, label }) => (
            <div key={label} className={styles.legendItem}>
              <div className={styles.legendDot} style={{ background: color }} />
              <strong className={styles.legendVal}>{val}</strong>
              <span className={styles.legendLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Goals */}
      <h2 className={styles.sectionTitle}>Your Goals</h2>
      <div className={styles.goalsScroll}>
        {GOALS.map((g) => <GoalProgressCard key={g.id} goal={g} />)}
      </div>

      {/* Needs breakdown */}
      <h2 className={styles.sectionTitle}>Needs Breakdown</h2>
      <div className={styles.card}>
        {NEEDS.map((item) => (
          <div key={item.name} className={styles.catRow}>
            <div className={styles.catIcon} style={{ background: item.bg }}>{item.icon}</div>
            <div className={styles.catInfo}>
              <span className={styles.catName}>{item.name}</span>
              <span className={styles.catSub}>{item.sub}</span>
            </div>
            <div className={styles.catAmount}>
              <span className={styles.catVal}>${item.amount.toLocaleString()}</span>
              <span className={styles.catPct}>{item.pct}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Wants breakdown */}
      <h2 className={styles.sectionTitle}>Wants Breakdown</h2>
      <div className={styles.card}>
        {WANTS.map((item) => (
          <div key={item.name} className={styles.catRow}>
            <div className={styles.catIcon} style={{ background: item.bg }}>{item.icon}</div>
            <div className={styles.catInfo}>
              <span className={styles.catName}>{item.name}</span>
              <span className={styles.catSub}>{item.sub}</span>
            </div>
            <div className={styles.catAmount}>
              <span className={styles.catVal}>${item.amount}</span>
              <span className={styles.catPct}>{item.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
