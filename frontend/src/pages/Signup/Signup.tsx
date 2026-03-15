// Signup page — handles new user account creation and redirects to onboarding
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from '../Login/Login.module.css'; // reuse auth styles
import api, { extractApiError } from '../../lib/api';
import { validateEmail, validatePasswordStrength } from '../../lib/validation';
import { useAuth } from '../../context/AuthContext';
import type { ApiResponse, AuthResponse } from '../../types';

export function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Access the login action from AuthContext

  // Form field state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Server/API error state (e.g. email already in use)
  const [error, setError] = useState('');

  // Validation error states — one per field
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); // Clear any previous server errors on each new submission

    // Run all field validations first — before hitting the API
    const firstNameErr = !firstName ? 'First name is required.' : '';
    if (firstNameErr) { setFirstNameError(firstNameErr); return; }

    const lastNameErr = !lastName ? 'Last name is required.' : '';
    if (lastNameErr) { setLastNameError(lastNameErr); return; }

    const emailErr = validateEmail(email);
    if (emailErr) { setEmailError(emailErr); return; }

    const passwordErr = validatePasswordStrength(password);
    if (passwordErr) { setPasswordError(passwordErr); return; }

    // Validation passed — now start the loading state before the API call
    try {
      // POST new user credentials to the signup endpoint
      const res = await api.post<ApiResponse<AuthResponse>>('/auth/signup', {
        firstName,
        lastName,
        email,
        password,
      });
      // Store token and user in AuthContext, then redirect to onboarding
      login(res.data.data.token, res.data.data.user);
      navigate('/onboarding');
    } catch (err: unknown) {
      // Use shared extractApiError utility to pull the server message, or fall back to a generic one
      setError(extractApiError(err, 'Signup failed. Please try again.'));
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
          <h1 className={styles.title}>Create your account</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* First name field — clears error as soon as user starts retyping */}
            <Input
              label="First name"
              type="text"
              placeholder="Alex"
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); setFirstNameError(''); }}
              error={firstNameError}
              required
            />

            {/* Last name field — clears error as soon as user starts retyping */}
            <Input
              label="Last name"
              type="text"
              placeholder="Johnson"
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); setLastNameError(''); }}
              error={lastNameError}
              required
            />

            {/* Email field — clears error as soon as user starts retyping */}
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
              error={emailError}
              required
            />

            {/* Password field — minLength removed, validatePasswordStrength handles all rules */}
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters with a special character"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
              error={passwordError}
              required
            />
            {/* Server-level error message — uses the correct rose design token */}
            {error && <p style={{ color: 'var(--color-rose)', fontSize: '0.875rem' }}>{error}</p>}
            <Button type="submit" variant="sage" fullWidth>
              Continue →
            </Button>
          </form>

          <div className={styles.divider}><span>or</span></div>

          <Button variant="secondary" fullWidth onClick={() => navigate('/login')}>
            Sign in instead
          </Button>
        </div>

        {/* Link to Login for users who already have an account */}
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
