// Email-based auth for Mini Family Office
import type { AuthSession, UserRole, AppUser } from './types';

const SESSION_KEY = 'mfo_session';
const CONFIG_KEY = 'mfo_config';
const USERS_KEY = 'mfo_users';

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

// User management
export function loadUsers(): AppUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AppUser[];
  } catch {
    return [];
  }
}

export function saveUsers(users: AppUser[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getUserByEmail(email: string): AppUser | null {
  const users = loadUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function registerUser(email: string, password: string, name?: string): AppUser {
  const users = loadUsers();
  const isFirst = users.length === 0;
  const user: AppUser = {
    id: crypto.randomUUID(),
    email: email.trim().toLowerCase(),
    passwordHash: simpleHash(password),
    role: isFirst ? 'admin' : 'member',
    status: isFirst ? 'active' : 'pending',
    name,
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, user]);
  return user;
}

export function approveUser(userId: string): void {
  const users = loadUsers();
  const updated = users.map((u) =>
    u.id === userId ? { ...u, status: 'active' as const } : u
  );
  saveUsers(updated);
}

export function rejectUser(userId: string): void {
  const users = loadUsers();
  saveUsers(users.filter((u) => u.id !== userId));
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

export function setSession(role: UserRole, email: string, memberName?: string): void {
  const session: AuthSession = {
    role,
    email,
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

export function verifyEmailLogin(email: string, password: string): AppUser | null {
  const user = getUserByEmail(email);
  if (!user) return null;
  if (user.passwordHash !== simpleHash(password)) return null;
  if (user.status !== 'active') return null;
  return user;
}

// Check if email belongs to a registered family member (in mfo_members)
export function getFamilyMemberByEmail(email: string): { name: string; nameZh: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('mfo_members');
    if (!raw) return null;
    const members = JSON.parse(raw) as Array<{ email?: string; name: string; nameZh: string }>;
    const found = members.find((m) => m.email && m.email.toLowerCase() === email.toLowerCase());
    return found ? { name: found.name, nameZh: found.nameZh } : null;
  } catch {
    return null;
  }
}

// Verify family member password (shared password set during setup)
export function verifyMemberPassword(input: string): boolean {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return false;
    const config = JSON.parse(raw);
    const inputHash = simpleHash(input);
    // Check member password first, fall back to admin password
    return inputHash === (config.memberPasswordHash || config.passwordHash);
  } catch {
    return false;
  }
}

// Register a family member who verified with member password
export function registerFamilyMember(email: string, password: string, name: string): AppUser {
  const users = loadUsers();
  const user: AppUser = {
    id: crypto.randomUUID(),
    email: email.trim().toLowerCase(),
    passwordHash: simpleHash(password),
    role: 'member',
    status: 'active', // Auto-active since verified via member password
    name,
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, user]);
  return user;
}

// Legacy password verify (kept for backward compat during setup)
export function verifyPassword(input: string, role: UserRole): boolean {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return false;
    const config = JSON.parse(raw);
    const inputHash = simpleHash(input);
    if (role === 'admin') {
      return inputHash === config.passwordHash;
    } else {
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
