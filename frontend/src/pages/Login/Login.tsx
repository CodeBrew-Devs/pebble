import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './Login.module.css';
import api from '../../lib/api';
import type { ApiResponse, AuthResponse } from '../../types';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
        email,
        password,
      });
      login(res.data.data.token, res.data.data.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? 'Invalid email or password.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
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
            {error && <p style={{ color: 'var(--color-error, #e53e3e)', fontSize: '0.875rem' }}>{error}</p>}
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
