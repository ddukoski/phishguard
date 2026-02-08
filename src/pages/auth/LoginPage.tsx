import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Fish } from 'lucide-react';
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-3 text-center">
        <div className="inline-flex h-14 items-center justify-center gap-2 bg-primary/10 px-5 text-primary">
          <Fish className="h-6 w-6" />
          <span className="text-3xl font-semibold text-primary">PhishGuard</span>
        </div>
        <h2 className="text-2xl font-semibold text-base-content">Sign in</h2>
        <p className="text-sm text-base-content/60">Welcome back. Let us continue your training.</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-6 mb-4">
        <label className="form-control">
          <div className="label pb-2">
            <span className="label-text font-medium text-base">Username or email</span>
          </div>
          <input
            id="login"
            type="text"
            required
            value={loginField}
            onChange={(e) => setLoginField(e.target.value)}
            className="input mb-2 input-bordered input-lg w-full bg-base-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Enter your username or email"
          />
        </label>

        <label className="form-control">
          <div className="label pb-2">
            <span className="label-text font-medium text-base">Password</span>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered input-lg w-full bg-base-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Enter your password"
          />
        </label>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mt-2">
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
