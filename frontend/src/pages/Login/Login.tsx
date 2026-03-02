import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './Login.module.css';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // TODO: replace with real API call via TanStack Query mutation
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    // Mock login — wire up to POST /user when backend is ready
    setTimeout(() => {
      login('mock-token', {
        id: '1',
        name: 'Alex Johnson',
        email,
        createdAt: new Date().toISOString(),
      });
      navigate('/dashboard');
    }, 600);
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.logo}>
          pebble<span>.</span>
        </div>
        <p className={styles.tagline}>Drop a pebble. Watch your savings ripple.</p>

        <div className={styles.card}>
          <h1 className={styles.title}>Welcome back</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className={styles.divider}><span>or</span></div>

          <Button variant="secondary" fullWidth onClick={() => navigate('/signup')}>
            Create an account
          </Button>
        </div>

        <p className={styles.switchText}>
          Don't have an account?{' '}
          <Link to="/signup" className={styles.switchLink}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
