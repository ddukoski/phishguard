import { createContext, useContext, type ReactNode } from 'react';
import type { AxiosInstance } from 'axios';
import api from '../lib/api';

type AxiosContextType = AxiosInstance;

const AxiosContext = createContext<AxiosContextType | null>(null);

export function AxiosProvider({ children }: { children: ReactNode }) {
  return <AxiosContext.Provider value={api}>{children}</AxiosContext.Provider>;
}

export function useApi() {
  const context = useContext(AxiosContext);
  if (!context) {
    throw new Error('useApi must be used within an AxiosProvider');
  }
  return context;
}
