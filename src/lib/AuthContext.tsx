'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AuthSession, UserRole } from './types';
import { getSession, setSession, clearSession, isSetupComplete } from './auth';

interface AuthContextValue {
  session: AuthSession | null;
  setupDone: boolean;
  loading: boolean;
  login: (role: UserRole, email: string, memberName?: string) => void;
  logout: () => void;
  refreshSetup: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  setupDone: false,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshSetup: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [setupDone, setSetupDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSessionState(getSession());
    setSetupDone(isSetupComplete());
    setLoading(false);
  }, []);

  const login = useCallback((role: UserRole, email: string, memberName?: string) => {
    setSession(role, email, memberName);
    setSessionState(getSession());
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSessionState(null);
  }, []);

  const refreshSetup = useCallback(() => {
    setSetupDone(isSetupComplete());
  }, []);

  return (
    <AuthContext.Provider value={{ session, setupDone, loading, login, logout, refreshSetup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
