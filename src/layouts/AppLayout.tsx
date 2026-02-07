import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/scenarios', label: 'Scenarios', icon: '🎯' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

const adminNavItems = [
  { to: '/admin', label: 'Admin Panel', icon: '⚙️' },
  { to: '/admin/scenarios', label: 'Manage Scenarios', icon: '📝' },
  { to: '/admin/users', label: 'Manage Users', icon: '👥' },
];

export default function AppLayout() {
  const { user, logout, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="text-xl font-bold text-blue-600">
                🛡️ PhishGuard
              </Link>
              <div className="hidden md:flex space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.to
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon} {item.label}
                  </Link>
                ))}
                {user.role === 'admin' &&
                  adminNavItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        location.pathname.startsWith(item.to)
                          ? 'bg-orange-100 text-orange-700'
                          : 'text-orange-600 hover:text-orange-900 hover:bg-orange-50'
                      }`}
                    >
                      {item.icon} {item.label}
                    </Link>
                  ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.username}
                {user.role === 'admin' && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">
                    Admin
                  </span>
                )}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
