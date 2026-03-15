// Shared validation utilities — reused across Login, Signup, and any future forms

// Validates email format — returns an error message, or empty string if valid
export const validateEmail = (value: string): string => {
  if (!value) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address.';
  return '';
};

// Validates password presence only — used on Login (format rules live in validatePasswordStrength)
export const validatePassword = (value: string): string => {
  if (!value) return 'Password is required.';
  return '';
};

// Validates password strength — used on Signup
// Requirements: min 8 chars, at least one special character
export const validatePasswordStrength = (value: string): string => {
  if (!value) return 'Password is required.';
  if (value.length < 8) return 'Password must be at least 8 characters.';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Password must include at least one special character.';
  return '';
};
