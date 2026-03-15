import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from '../Login/Login.module.css'; // reuse auth styles
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { ApiResponse, AuthResponse } from '../../types';

export function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post<ApiResponse<AuthResponse>>('/auth/signup', {
        firstName,
        lastName,
        email,
        password,
      });
      login(res.data.data.token, res.data.data.user);
      navigate('/onboarding');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? 'Signup failed. Please try again.';
      setError(msg);
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
          <h1 className={styles.title}>Create your account</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="First name"
              type="text"
              placeholder="Alex"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              label="Last name"
              type="text"
              placeholder="Johnson"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
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
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            {error && <p style={{ color: 'var(--color-error, #e53e3e)', fontSize: '0.875rem' }}>{error}</p>}
            <Button type="submit" variant="sage" fullWidth>
              Continue →
            </Button>
          </form>

          <div className={styles.divider}><span>or</span></div>

          <Button variant="secondary" fullWidth onClick={() => navigate('/login')}>
            Sign in instead
          </Button>
        </div>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" className={styles.switchLink}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
