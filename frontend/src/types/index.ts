// ── Core Domain Types ──────────────────────────────────

export type BudgetCategory = 'needs' | 'wants' | 'savings';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  onboardingCompletedAt: string | null;
  createdAt: string;
}

export interface Goal {
  id: string;
  label: string;
  icon: string;
  current: number;
  target: number;
  color: string; // CSS gradient string
}

export interface Transaction {
  id: string;
  name: string;
  amount: number;       // negative = expense, positive = income
  date: string;         // ISO date string
  category: BudgetCategory | null;
  tags: string[];
  icon: string;
  iconBg: string;
}

export interface BudgetSplit {
  needs: number;    // percentage 0–100
  wants: number;
  savings: number;
}

export interface Account {
  id: string;
  userId: string;
}

export interface Tag {
  id: string;
  name: string;
}

// ── Onboarding ──────────────────────────────────────────

export type GoalType =
  | 'emergency'
  | 'vacation'
  | 'investing'
  | 'purchase'
  | 'debt'
  | 'curious';

export type IncomeFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'annually';

export interface OnboardingState {
  goals: GoalType[];
  incomeAmount: string;
  incomeFrequency: IncomeFrequency;
  budgetSplit: BudgetSplit;
}

export interface BudgetSummary {
  incomeAmount: number;
  incomeFrequency: IncomeFrequency;
  budgetNeeds: number;
  budgetWants: number;
  budgetSavings: number;
}

// ── API Response Shapes ─────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
