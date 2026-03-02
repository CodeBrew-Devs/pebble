import { useState } from 'react';
import { CategoryTag } from '../../components/ui/CategoryTag';
import type { Transaction, BudgetCategory } from '../../types';
import styles from './Transactions.module.css';

// Mock data — replace with useQuery hook
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', name: "Trader Joe's",    amount: -67.42, date: '2026-03-01', category: 'needs',   tags: ['groceries'], icon: '🛒', iconBg: '#dcfce7' },
  { id: '2', name: 'Blue Bottle Coffee', amount: -8.50, date: '2026-03-01', category: 'wants',  tags: ['dining'],    icon: '☕', iconBg: '#ede9fe' },
  { id: '3', name: 'Paycheck',         amount: 2600,   date: '2026-02-28', category: null,      tags: [],            icon: '💰', iconBg: '#d1fae5' },
  { id: '4', name: 'Rent — March',     amount: -1400,  date: '2026-02-28', category: 'needs',   tags: ['housing'],   icon: '🏠', iconBg: '#fef9c3' },
  { id: '5', name: "Domino's Pizza",   amount: -24.99, date: '2026-02-28', category: null,      tags: [],            icon: '🍕', iconBg: '#fce7f3' },
  { id: '6', name: 'Netflix',          amount: -15.99, date: '2026-02-28', category: 'wants',   tags: ['subscription'], icon: '📺', iconBg: '#ecfdf5' },
];

const FILTERS: { label: string; value: BudgetCategory | 'all' | 'uncategorized' }[] = [
  { label: 'All',            value: 'all' },
  { label: 'Needs',          value: 'needs' },
  { label: 'Wants',          value: 'wants' },
  { label: 'Savings',        value: 'savings' },
  { label: 'Uncategorized',  value: 'uncategorized' },
];

function groupByDate(txs: Transaction[]) {
  const today    = '2026-03-01';
  const yesterday = '2026-02-28';
  const groups: Record<string, Transaction[]> = {};
  txs.forEach((tx) => {
    const label =
      tx.date === today ? 'Today' :
      tx.date === yesterday ? 'Yesterday' :
      tx.date;
    groups[label] = [...(groups[label] ?? []), tx];
  });
  return groups;
}

export function Transactions() {
  const [filter, setFilter] = useState<'all' | BudgetCategory | 'uncategorized'>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = MOCK_TRANSACTIONS.filter((tx) => {
    const matchSearch = tx.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'uncategorized' ? tx.category === null :
      tx.category === filter;
    return matchSearch && matchFilter;
  });

  const grouped = groupByDate(filtered);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Transactions</h1>
          <p className={styles.month}>March 2026</p>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search transactions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={[styles.chip, filter === f.value ? styles.chipActive : ''].join(' ')}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transaction groups */}
      {Object.entries(grouped).map(([date, txs]) => (
        <div key={date}>
          <p className={styles.dateLabel}>{date}</p>
          <div className={styles.txList}>
            {txs.map((tx) => (
              <div key={tx.id} className={styles.txItem}>
                <div className={styles.txIcon} style={{ background: tx.iconBg }}>
                  {tx.icon}
                </div>
                <div className={styles.txInfo}>
                  <span className={styles.txName}>{tx.name}</span>
                  <div className={styles.txMeta}>
                    {tx.amount > 0 ? (
                      <span className={styles.incomeLabel}>Income</span>
                    ) : tx.category ? (
                      <CategoryTag category={tx.category} />
                    ) : (
                      <CategoryTag category="uncategorized" />
                    )}
                  </div>
                </div>
                <div className={styles.txRight}>
                  <span
                    className={[
                      styles.txAmount,
                      tx.amount > 0 ? styles.txIncome : '',
                    ].join(' ')}
                  >
                    {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                  <span className={styles.txDate}>
                    {new Date(tx.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* FAB */}
      <button className={styles.fab} onClick={() => setShowModal(true)} aria-label="Add transaction">
        +
      </button>

      {/* Add transaction modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHandle} />
            <h2 className={styles.modalTitle}>Add Transaction</h2>
            <div className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <input className={styles.formInput} type="text" placeholder="e.g. Trader Joe's…" />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Amount</label>
                  <input className={styles.formInput} type="number" placeholder="0.00" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Date</label>
                  <input className={styles.formInput} type="text" placeholder="Mar 1, 2026" />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category</label>
                <div className={styles.catButtons}>
                  {(['needs', 'wants', 'savings'] as BudgetCategory[]).map((cat) => (
                    <button key={cat} className={[styles.catBtn, styles[cat]].join(' ')}>
                      {cat === 'needs' ? '🏠' : cat === 'wants' ? '🎉' : '💰'}{' '}
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tags (optional)</label>
                <input className={styles.formInput} type="text" placeholder="e.g. subscription, recurring…" />
              </div>
              <div className={styles.modalActions}>
                <button className={styles.modalCancel} onClick={() => setShowModal(false)}>Cancel</button>
                <button className={styles.modalAdd} onClick={() => setShowModal(false)}>Add Transaction</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
