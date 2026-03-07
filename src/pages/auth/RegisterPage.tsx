import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Fish } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, email, password, passwordConfirmation);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
      };
      const message = axiosErr?.response?.data?.message || 'Registration failed.';
      const errors = axiosErr?.response?.data?.errors;
      if (errors) {
        setError(Object.values(errors).flat().join(' '));
      } else {
        setError(message);
      }
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
        <h2 className="text-2xl font-semibold text-base-content">Create your account</h2>
        <p className="text-sm text-base-content/60">
          Start building phishing detection confidence.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-6 mb-4">
        <label className="form-control">
          <div className="label pb-2">
            <span className="label-text font-medium text-base">Username</span>
          </div>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input mb-2 input-bordered input-lg w-full bg-base-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Choose a username"
          />
        </label>

        <label className="form-control">
          <div className="label pb-2">
            <span className="label-text font-medium text-base">Email</span>
          </div>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input mb-2 input-bordered input-lg w-full bg-base-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Enter your email"
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
            className="input mb-2 input-bordered input-lg w-full bg-base-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="At least 8 characters"
          />
        </label>

        <label className="form-control">
          <div className="label pb-2">
            <span className="label-text font-medium text-base">Confirm password</span>
          </div>
          <input
            id="password_confirmation"
            type="password"
            required
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="input input-bordered input-lg w-full bg-base-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Re-enter your password"
          />
        </label>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mt-2">
        {loading ? 'Creating account...' : 'Create account'}
      </button>

      <p className="text-center text-sm text-base-content/70">
        Already have access?{' '}
        <Link to="/login" className="link link-primary">
          Sign in
        </Link>
      </p>
    </form>
  );
}
