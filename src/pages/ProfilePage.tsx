import { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, Lock, Star, UserRound } from 'lucide-react';
import { useApi } from '../contexts/AxiosContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingState from '../components/ui/LoadingState';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import StatTile from '../components/ui/StatTile';

export default function ProfilePage() {
  const api = useApi();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/profile')
      .then((res) => {
        setProfile(res.data.user);
        setStats(res.data.stats);
        setForm({ username: res.data.user.username, email: res.data.user.email });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await api.put('/profile', form);
      setProfile(res.data.user);
      setEditing(false);
      setMessage('Profile updated successfully.');
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Update failed.'
      );
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.put('/profile/password', passwordForm);
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
      setMessage('Password updated successfully.');
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Password update failed.'
      );
    }
  };

  if (loading) {
    return <LoadingState label="Loading profile" />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Profile"
        description="Manage your account details and credentials."
        icon={UserRound}
      />

      {message && (
        <div className="alert alert-success">
          <span className="text-sm">{message}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          <span className="text-sm">{error}</span>
        </div>
      )}

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatTile label="Attempts" value={stats.total_attempts} icon={BarChart3} />
          <StatTile label="Correct" value={stats.correct_attempts} icon={CheckCircle2} />
          <StatTile label="Total Score" value={stats.total_score} icon={Star} />
        </div>
      )}

      <SectionCard
        title="Account information"
        description="Keep your personal details accurate."
        actions={
          <button onClick={() => setEditing(!editing)} className="btn btn-ghost btn-sm">
            {editing ? 'Cancel' : 'Edit'}
          </button>
        }
      >
        {editing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <label className="form-control">
              <div className="label">
                <span className="label-text">Username</span>
              </div>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="input input-bordered w-full"
              />
            </label>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Email</span>
              </div>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input input-bordered w-full"
              />
            </label>
            <button type="submit" className="btn btn-primary w-fit">
              Save changes
            </button>
          </form>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-base-content/50">Username</p>
              <p className="text-base font-semibold text-base-content">
                {profile?.username as string}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-base-content/50">Email</p>
              <p className="text-base font-semibold text-base-content">
                {profile?.email as string}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-base-content/50">Role</p>
              <p className="text-base font-semibold text-base-content capitalize">{user?.role}</p>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Change password" description="Refresh your credentials regularly.">
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <label className="form-control">
            <div className="label">
              <span className="label-text">Current password</span>
            </div>
            <input
              type="password"
              value={passwordForm.current_password}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, current_password: e.target.value })
              }
              className="input input-bordered w-full"
              required
            />
          </label>
          <label className="form-control">
            <div className="label">
              <span className="label-text">New password</span>
            </div>
            <input
              type="password"
              value={passwordForm.password}
              onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
              className="input input-bordered w-full"
              required
            />
          </label>
          <label className="form-control">
            <div className="label">
              <span className="label-text">Confirm new password</span>
            </div>
            <input
              type="password"
              value={passwordForm.password_confirmation}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })
              }
              className="input input-bordered w-full"
              required
            />
          </label>
          <button type="submit" className="btn btn-error w-fit">
            <Lock className="h-4 w-4" />
            Update password
          </button>
        </form>
      </SectionCard>
    </div>
  );
}
