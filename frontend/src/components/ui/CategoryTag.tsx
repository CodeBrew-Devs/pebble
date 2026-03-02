import type { BudgetCategory } from '../../types';
import styles from './CategoryTag.module.css';

interface CategoryTagProps {
  category: BudgetCategory | 'uncategorized';
}

const LABELS: Record<string, string> = {
  needs: 'Needs',
  wants: 'Wants',
  savings: 'Savings',
  uncategorized: 'Uncategorized',
};

export function CategoryTag({ category }: CategoryTagProps) {
  return (
    <span className={[styles.tag, styles[category]].join(' ')}>
      {LABELS[category]}
    </span>
  );
}
