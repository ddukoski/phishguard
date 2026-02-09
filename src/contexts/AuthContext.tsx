import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useApi } from './AxiosContext';
import type { User } from '../types';

type AuthContextType = {
  readonly user: User | null;
  readonly isAuthenticated: boolean;
  readonly login: (loginField: string, password: string) => Promise<void>;
  readonly register: (
    username: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => Promise<void>;
  readonly logout: () => Promise<void>;
  readonly refreshUser: () => Promise<void>;
  readonly loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const api = useApi();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch {
      setUser(null);
    }
  }, [api]);

  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [api]);

  useEffect(() => {
    const handleLogout = () => setUser(null);
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = useCallback(
    async (loginField: string, password: string) => {
      const res = await api.post('/auth/login', { login: loginField, password });
      setUser(res.data.user);
    },
    [api]
  );

  const register = useCallback(
    async (username: string, email: string, password: string, passwordConfirmation: string) => {
      const res = await api.post('/auth/register', {
        username,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setUser(res.data.user);
    },
    [api]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  }, [api]);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, register, logout, refreshUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
