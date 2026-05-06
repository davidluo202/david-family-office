// Simple password-based auth for Mini Family Office
import type { AuthSession, UserRole } from './types';

const SESSION_KEY = 'mfo_session';
const CONFIG_KEY = 'mfo_config';

// Simple hash function (not cryptographic, but fine for a family app)
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to hex and add salt-like prefix
  return 'mfo_' + Math.abs(hash).toString(16).padStart(8, '0');
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setSession(role: UserRole, memberName?: string): void {
  const session: AuthSession = {
    role,
    memberName,
    loginTime: Date.now(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function isSetupComplete(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return false;
    const config = JSON.parse(raw);
    return config.setupComplete === true;
  } catch {
    return false;
  }
}

export function verifyPassword(input: string, role: UserRole): boolean {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return false;
    const config = JSON.parse(raw);
    const inputHash = simpleHash(input);
    if (role === 'admin') {
      return inputHash === config.passwordHash;
    } else {
      // Member can use either the member password or admin password
      return inputHash === (config.memberPasswordHash || config.passwordHash);
    }
  } catch {
    return false;
  }
}

export function isAdmin(): boolean {
  const session = getSession();
  return session?.role === 'admin';
}

export function isLoggedIn(): boolean {
  return getSession() !== null;
}
