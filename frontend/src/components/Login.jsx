import { useState } from 'react';
import CapraLogo from './CapraLogo';
import { getApiUrl } from '../hooks/useElectron';

const API_URL = getApiUrl();

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const response = await fetch(API_URL + '/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        onLogin(data.token, data.user);
      } else {
        const response = await fetch(API_URL + '/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, name: name || username }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        setSuccess('Account created. Awaiting activation.');
        setUsername('');
        setPassword('');
        setName('');
        setTimeout(() => setMode('login'), 3000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center dot-pattern p-4 bg-gray-50">
      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="rounded-xl p-8 bg-white border border-gray-200 shadow-lg animate-fade-in-up">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <CapraLogo size="lg" />
            </div>
            <p className="text-base font-medium text-gray-500">
              {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex p-1 mb-6 rounded-lg bg-gray-100 border border-gray-200">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-base font-medium focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-colors"
                  placeholder="Optional"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-base font-medium focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-colors"
                placeholder="Enter username"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-base font-medium focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-colors"
                placeholder={mode === 'register' ? 'Min 6 characters' : 'Enter password'}
                required
                minLength={mode === 'register' ? 6 : undefined}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 animate-fade-in">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 animate-fade-in">
                <p className="text-sm font-medium text-green-600">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-base font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#10b981', color: '#ffffff' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {mode === 'login' ? 'Signing in...' : 'Creating...'}
                </span>
              ) : (
                mode === 'login' ? 'Sign in' : 'Create Account'
              )}
            </button>
          </form>

          {mode === 'register' && (
            <p className="mt-4 text-center text-sm font-medium text-gray-500">
              Account activation required after registration
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
