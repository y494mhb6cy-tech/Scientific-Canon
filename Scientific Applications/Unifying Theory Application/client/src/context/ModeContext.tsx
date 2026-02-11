import { createContext, useState, useCallback, type ReactNode } from 'react';
import type { ModeType } from '../api/client';

export interface ModeContextValue {
  currentMode: ModeType;
  setMode: (mode: ModeType) => void;
}

export const ModeContext = createContext<ModeContextValue>({
  currentMode: 'guided',
  setMode: () => {},
});

export function ModeProvider({ children }: { children: ReactNode }) {
  const [currentMode, setCurrentMode] = useState<ModeType>('guided');

  const setMode = useCallback((mode: ModeType) => {
    setCurrentMode(mode);
  }, []);

  return (
    <ModeContext.Provider value={{ currentMode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}
