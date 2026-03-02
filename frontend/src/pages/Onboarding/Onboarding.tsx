import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import type { GoalType, IncomeFrequency, BudgetSplit } from '../../types';
import styles from './Onboarding.module.css';

const GOALS: { id: GoalType; icon: string; title: string; sub: string }[] = [
  { id: 'emergency', icon: '🛡️', title: 'Emergency Fund', sub: '3–6 months of expenses' },
  { id: 'vacation',  icon: '✈️', title: 'Vacation',        sub: 'Trip planning' },
  { id: 'investing', icon: '📈', title: 'Investing',        sub: 'Retirement & growth' },
  { id: 'purchase',  icon: '🛍️', title: 'Big Purchase',    sub: 'Car, home, gadget' },
  { id: 'debt',      icon: '💳', title: 'Pay Off Debt',     sub: 'Credit cards, loans' },
  { id: 'curious',   icon: '💡', title: 'Just Curious',     sub: 'Understand my spending' },
];

const FREQUENCIES: { value: IncomeFrequency; label: string }[] = [
  { value: 'monthly',   label: 'Monthly' },
  { value: 'biweekly',  label: 'Bi-weekly' },
  { value: 'weekly',    label: 'Weekly' },
  { value: 'annually',  label: 'Annually' },
  { value: 'daily',     label: 'Daily' },
];

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 3;

  // Step 1
  const [selectedGoals, setSelectedGoals] = useState<GoalType[]>([]);
  // Step 2
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeFrequency, setIncomeFrequency] = useState<IncomeFrequency>('monthly');
  // Step 3
  const [split, setSplit] = useState<BudgetSplit>({ needs: 50, wants: 30, savings: 20 });

  function toggleGoal(id: GoalType) {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  function handleFinish() {
    // TODO: persist onboarding state to API
    navigate('/dashboard');
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        {/* Progress bar */}
        <div className={styles.progress}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={[
                styles.progressStep,
                i + 1 < step ? styles.done : '',
                i + 1 === step ? styles.active : '',
              ].join(' ')}
            />
          ))}
        </div>

        {/* ── Step 1: Goals ── */}
        {step === 1 && (
          <div className={styles.step}>
            <div className={styles.stepLabel}>Step 1 of {TOTAL_STEPS}</div>
            <h2 className={styles.stepTitle}>What are you saving for?</h2>
            <p className={styles.stepSub}>
              Pick as many as you like — we'll build your plan around these goals.
            </p>
            <div className={styles.goalGrid}>
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={[
                    styles.goalCard,
                    selectedGoals.includes(g.id) ? styles.goalCardSelected : '',
                  ].join(' ')}
                  onClick={() => toggleGoal(g.id)}
                >
                  <span className={styles.goalIcon}>{g.icon}</span>
                  <span className={styles.goalTitle}>{g.title}</span>
                  <span className={styles.goalSub}>{g.sub}</span>
                </button>
              ))}
            </div>
            <div className={styles.nav}>
              <Button variant="secondary" onClick={() => navigate('/signup')}>
                ← Back
              </Button>
              <Button fullWidth onClick={() => setStep(2)} disabled={selectedGoals.length === 0}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Income ── */}
        {step === 2 && (
          <div className={styles.step}>
            <div className={styles.stepLabel}>Step 2 of {TOTAL_STEPS}</div>
            <h2 className={styles.stepTitle}>How much do you earn?</h2>
            <p className={styles.stepSub}>
              We'll use this to give you a realistic breakdown. You can always update it later.
            </p>
            <div className={styles.incomeRow}>
              <Input
                label="Amount"
                type="number"
                placeholder="0.00"
                value={incomeAmount}
                onChange={(e) => setIncomeAmount(e.target.value)}
              />
              <div className={styles.selectWrapper}>
                <label className={styles.selectLabel}>Frequency</label>
                <select
                  className={styles.select}
                  value={incomeFrequency}
                  onChange={(e) => setIncomeFrequency(e.target.value as IncomeFrequency)}
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.nav}>
              <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
              <Button fullWidth onClick={() => setStep(3)} disabled={!incomeAmount}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Budget split ── */}
        {step === 3 && (
          <div className={styles.step}>
            <div className={styles.stepLabel}>Step 3 of {TOTAL_STEPS}</div>
            <h2 className={styles.stepTitle}>Let's set your split</h2>
            <p className={styles.stepSub}>
              The classic 50/30/20 rule is a great start. Tweak it to fit your life.
            </p>

            <div className={styles.splitCard}>
              {/* Visual bar */}
              <div className={styles.splitBar}>
                <div className={styles.splitNeeds}  style={{ width: `${split.needs}%` }} />
                <div className={styles.splitWants}  style={{ width: `${split.wants}%` }} />
                <div className={styles.splitSavings} style={{ width: `${split.savings}%` }} />
              </div>

              {/* Sliders */}
              {(
                [
                  { key: 'needs',   label: '🏠 Needs',   color: 'var(--color-needs)' },
                  { key: 'wants',   label: '🎉 Wants',   color: 'var(--color-wants)' },
                  { key: 'savings', label: '💰 Savings', color: 'var(--color-savings)' },
                ] as const
              ).map(({ key, label, color }) => (
                <div key={key} className={styles.sliderRow}>
                  <div className={styles.sliderHeader}>
                    <span className={styles.sliderLabel}>{label}</span>
                    <span className={styles.sliderPct} style={{ color }}>{split[key]}%</span>
                  </div>
                  <input
                    type="range"
                    min={key === 'needs' ? 10 : 5}
                    max={key === 'needs' ? 80 : 60}
                    value={split[key]}
                    style={{ accentColor: color }}
                    onChange={(e) =>
                      setSplit((prev) => ({ ...prev, [key]: parseInt(e.target.value) }))
                    }
                  />
                </div>
              ))}
            </div>

            <div className={styles.nav}>
              <Button variant="secondary" onClick={() => setStep(2)}>← Back</Button>
              <Button variant="sage" fullWidth onClick={handleFinish}>
                Take me to my dashboard 🎉
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
