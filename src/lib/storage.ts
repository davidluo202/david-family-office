// LocalStorage persistence for Mini Family Office
import type {
  FamilyConfig,
  FamilyData,
  FamilyMember,
  HouseholdExpenses,
  Asset,
  Liability,
  BankAccount,
  Goal,
  RecurringBill,
} from './types';

const KEYS = {
  config: 'mfo_config',
  members: 'mfo_members',
  expenses: 'mfo_expenses',
  assets: 'mfo_assets',
  liabilities: 'mfo_liabilities',
  accounts: 'mfo_accounts',
  goals: 'mfo_goals',
  bills: 'mfo_bills',
};

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save(key: string, data: unknown): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// Config
export function saveConfig(config: FamilyConfig): void {
  save(KEYS.config, config);
}

export function loadConfig(): FamilyConfig | null {
  return load<FamilyConfig | null>(KEYS.config, null);
}

// Members
export function saveMembers(members: FamilyMember[]): void {
  save(KEYS.members, members);
}

export function loadMembers(): FamilyMember[] {
  return load<FamilyMember[]>(KEYS.members, []);
}

// Expenses
export function saveExpenses(expenses: HouseholdExpenses): void {
  save(KEYS.expenses, expenses);
}

export function loadExpenses(): HouseholdExpenses {
  return load<HouseholdExpenses>(KEYS.expenses, {
    monthly: [],
    annualExpenses: [],
    annualIncome: [],
  });
}

// Assets
export function saveAssets(assets: Asset[]): void {
  save(KEYS.assets, assets);
}

export function loadAssets(): Asset[] {
  return load<Asset[]>(KEYS.assets, []);
}

// Liabilities
export function saveLiabilities(liabilities: Liability[]): void {
  save(KEYS.liabilities, liabilities);
}

export function loadLiabilities(): Liability[] {
  return load<Liability[]>(KEYS.liabilities, []);
}

// Bank Accounts
export function saveAccounts(accounts: BankAccount[]): void {
  save(KEYS.accounts, accounts);
}

export function loadAccounts(): BankAccount[] {
  return load<BankAccount[]>(KEYS.accounts, []);
}

// Goals
export function saveGoals(goals: Goal[]): void {
  save(KEYS.goals, goals);
}

export function loadGoals(): Goal[] {
  return load<Goal[]>(KEYS.goals, []);
}

// Export all data
export function exportAllData(): FamilyData {
  return {
    config: loadConfig()!,
    members: loadMembers(),
    expenses: loadExpenses(),
    assets: loadAssets(),
    liabilities: loadLiabilities(),
    accounts: loadAccounts(),
    goals: loadGoals(),
  };
}

// Bills
export function loadBills(): RecurringBill[] { return load<RecurringBill[]>(KEYS.bills, []); }
export function saveBills(bills: RecurringBill[]): void { save(KEYS.bills, bills); }

// Import all data
export function importAllData(data: FamilyData): void {
  if (data.config) saveConfig(data.config);
  if (data.members) saveMembers(data.members);
  if (data.expenses) saveExpenses(data.expenses);
  if (data.assets) saveAssets(data.assets);
  if (data.liabilities) saveLiabilities(data.liabilities);
  if (data.accounts) saveAccounts(data.accounts);
  if (data.goals) saveGoals(data.goals);
}

// Reset all data
export function resetAllData(): void {
  Object.values(KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
  localStorage.removeItem('mfo_session');
}
