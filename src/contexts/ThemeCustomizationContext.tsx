import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemeCustomization = {
  readonly primaryHue: number;
  readonly primarySaturation: number;
  readonly primaryLightness: number;
};

const DEFAULT_CUSTOMIZATION: ThemeCustomization = {
  primaryHue: 165,
  primarySaturation: 0.25,
  primaryLightness: 0.6,
};

type ThemeCustomizationContextValue = {
  readonly customization: ThemeCustomization;
  readonly updateCustomization: (updates: Partial<ThemeCustomization>) => void;
  readonly resetCustomization: () => void;
};

const ThemeCustomizationContext = createContext<ThemeCustomizationContextValue | null>(null);

const STORAGE_KEY = 'phishguard-theme-customization';

function applyThemeCustomization(customization: ThemeCustomization) {
  const root = document.documentElement;

  const lightPrimary = `oklch(${(customization.primaryLightness * 100).toFixed(1)}% ${customization.primarySaturation.toFixed(2)} ${customization.primaryHue})`;
  const darkPrimary = `oklch(${((customization.primaryLightness + 0.1) * 100).toFixed(1)}% ${customization.primarySaturation.toFixed(2)} ${customization.primaryHue})`;

  root.style.setProperty('--color-primary-light', lightPrimary);
  root.style.setProperty('--color-primary-dark', darkPrimary);
}

export function ThemeCustomizationProvider({ children }: { children: ReactNode }) {
  const [customization, setCustomizationState] = useState<ThemeCustomization>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as ThemeCustomization;
      } catch {
        return DEFAULT_CUSTOMIZATION;
      }
    }
    return DEFAULT_CUSTOMIZATION;
  });

  useEffect(() => {
    applyThemeCustomization(customization);
  }, [customization]);

  const updateCustomization = (updates: Partial<ThemeCustomization>) => {
    const next = { ...customization, ...updates };
    setCustomizationState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    applyThemeCustomization(next);
  };

  const resetCustomization = () => {
    setCustomizationState(DEFAULT_CUSTOMIZATION);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOMIZATION));
    applyThemeCustomization(DEFAULT_CUSTOMIZATION);
  };

  const value = useMemo(
    () => ({ customization, updateCustomization, resetCustomization }),
    [customization]
  );

  return (
    <ThemeCustomizationContext.Provider value={value}>
      {children}
    </ThemeCustomizationContext.Provider>
  );
}

export function useThemeCustomization() {
  const context = useContext(ThemeCustomizationContext);
  if (!context) {
    throw new Error('useThemeCustomization must be used within ThemeCustomizationProvider');
  }
  return context;
}
