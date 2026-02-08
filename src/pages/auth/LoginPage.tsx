import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginField, setLoginField] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginField, password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <LogIn className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-semibold text-base-content">Sign in</h2>
        <p className="text-sm text-base-content/60">Welcome back. Let us continue your training.</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <label className="form-control">
          <div className="label">
            <span className="label-text">Username or email</span>
          </div>
          <input
            id="login"
            type="text"
            required
            value={loginField}
            onChange={(e) => setLoginField(e.target.value)}
            className="input input-bordered w-full"
            placeholder="Enter your username or email"
          />
        </label>

        <label className="form-control">
          <div className="label">
            <span className="label-text">Password</span>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered w-full"
            placeholder="Enter your password"
          />
        </label>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? 'Signing in...' : 'Sign in'}
      </button>

      <p className="text-center text-sm text-base-content/70">
        New to PhishGuard?{' '}
        <Link to="/register" className="link link-primary">
          Create an account
        </Link>
      </p>
    </form>
  );
}
