import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { createSession as apiCreateSession, type ModeType } from '../api/client';

export interface SessionContextValue {
  sessionId: string | null;
  mode: ModeType;
  loading: boolean;
  createNewSession: (mode: ModeType) => Promise<void>;
}

export const SessionContext = createContext<SessionContextValue>({
  sessionId: null,
  mode: 'guided',
  loading: false,
  createNewSession: async () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [mode, setMode] = useState<ModeType>('guided');
  const [loading, setLoading] = useState(false);

  const createNewSession = useCallback(async (newMode: ModeType) => {
    setLoading(true);
    try {
      const res = await apiCreateSession(newMode);
      setSessionId(res.sessionId);
      setMode(res.mode);
    } catch (err) {
      console.error('Failed to create session:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    createNewSession('guided');
  }, [createNewSession]);

  return (
    <SessionContext.Provider value={{ sessionId, mode, loading, createNewSession }}>
      {children}
    </SessionContext.Provider>
  );
}
