'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

export interface HeaderConfig {
  earliestEventDate?: string;
  availableDates?: string[];
  onDayClick?: (day: Date) => void;
}

interface HeaderConfigContextValue {
  config: HeaderConfig;
  setConfig: (next: HeaderConfig) => void;
}

const HeaderConfigContext = createContext<HeaderConfigContextValue | null>(null);

export function HeaderConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<HeaderConfig>({});

  const value = useMemo<HeaderConfigContextValue>(() => ({ config, setConfig }), [config]);

  return <HeaderConfigContext.Provider value={value}>{children}</HeaderConfigContext.Provider>;
}

export function useHeaderConfig() {
  const ctx = useContext(HeaderConfigContext);
  if (!ctx) throw new Error('useHeaderConfig must be used within HeaderConfigProvider');
  return ctx;
}
