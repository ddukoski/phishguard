import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AxiosProvider } from './contexts/AxiosContext';
import GuestLayout from './layouts/GuestLayout';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ScenariosPage from './pages/scenarios/ScenariosPage';
import ScenarioPlayPage from './pages/scenarios/ScenarioPlayPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminScenariosPage from './pages/admin/AdminScenariosPage';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { ThemeProvider } from './components/ui/ThemeProvider';
import { ThemeCustomizationProvider } from './contexts/ThemeCustomizationContext';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ThemeCustomizationProvider>
          <Toaster position="bottom-right" toastOptions={{ duration: 2400 }} />
          <BrowserRouter>
            <AxiosProvider>
              <AuthProvider>
                <Routes>
                  <Route element={<GuestLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                  </Route>

                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/scenarios" element={<ScenariosPage />} />
                    <Route path="/scenarios/:id" element={<ScenarioPlayPage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />

                    <Route path="/admin" element={<AdminAnalyticsPage />} />
                    <Route path="/admin/users" element={<AdminUsersPage />} />
                    <Route path="/admin/scenarios" element={<AdminScenariosPage />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </AuthProvider>
            </AxiosProvider>
          </BrowserRouter>
        </ThemeCustomizationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
