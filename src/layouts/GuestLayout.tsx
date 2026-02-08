import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthShell from '../components/layout/AuthShell';
import LoadingState from '../components/ui/LoadingState';

export default function GuestLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState label="Loading sign-in experience" />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthShell>
      <Outlet />
    </AuthShell>
  );
}
