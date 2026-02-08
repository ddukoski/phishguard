import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppShell from '../components/layout/AppShell';
import LoadingState from '../components/ui/LoadingState';

export default function AppLayout() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return <LoadingState label="Preparing your workspace" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell user={user} onLogout={logout}>
      <Outlet />
    </AppShell>
  );
}
