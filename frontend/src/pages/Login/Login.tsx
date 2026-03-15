// Login page — handles user authentication with email/password
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './Login.module.css';
import api, { extractApiError } from '../../lib/api';
import { validateEmail, validatePassword } from '../../lib/validation';
import type { ApiResponse, AuthResponse } from '../../types';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Access the login action from AuthContext

  // Form field state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);

  // Validation error state for email
  const [emailError, setEmailError] = useState('');

  // Validation error state for password
  const [passwordError, setPasswordError] = useState('');

  // Server/API error state (e.g. wrong credentials)
  const [error, setError] = useState('');

  // validateEmail and validatePassword are imported from src/lib/validation.ts

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); // Clear any previous server errors on each new submission

    // Run all validation first — before setting loading state or hitting the API
    const emailErr = validateEmail(email);
    if (emailErr) { setEmailError(emailErr); return; }

    const passwordErr = validatePassword(password);
    if (passwordErr) { setPasswordError(passwordErr); return; }

    // Validation passed — now start the loading state before the API call
    setIsLoading(true);

    try {
      // POST credentials to the auth endpoint
      const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
        email,
        password,
      });
      // Store token and user in AuthContext, then redirect to dashboard
      login(res.data.data.token, res.data.data.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      // Use shared extractApiError utility to pull the server message, or fall back to a generic one
      setError(extractApiError(err, 'Invalid email or password.'));
    } finally {
      // Always reset the loading state when the request settles
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>

        {/* Brand logo */}
        <div className={styles.logo}>
          pebble<span>.</span>
        </div>
        <p className={styles.tagline}>Drop a pebble. Watch your savings ripple.</p>

        <div className={styles.card}>
          <h1 className={styles.title}>Welcome back</h1>
          <form onSubmit={handleSubmit} className={styles.form}>

            {/* Email field */}
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {setEmail(e.target.value); setEmailError('');}}
              error={emailError}
              required
            />

            {/* Password field */}
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {setPassword(e.target.value); setPasswordError('');}}
              error={passwordError}
              required
            />

            {/* Server-level error message (e.g. wrong credentials) */}
            {error && <p style={{ color: 'var(--color-rose)', fontSize: '0.875rem' }}>{error}</p>}

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className={styles.divider}><span>or</span></div>

          <Button variant="secondary" fullWidth onClick={() => navigate('/signup')}>
            Create an account
          </Button>
        </div>

        {/* Link to Signup for users without an account */}
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
