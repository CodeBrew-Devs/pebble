import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pebble_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handler — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pebble_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Extracts a human-readable error message from an Axios error response.
// Falls back to the provided fallback string if no server message is found.
export const extractApiError = (err: unknown, fallback: string): string =>
  (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? fallback;
