// Core types for Mini Family Office

export type UserRole = 'admin' | 'member';
export type UserStatus = 'active' | 'pending';

export interface AppUser {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  name?: string;
  createdAt: string;
}

export interface AuthSession {
  role: UserRole;
  email: string;
  memberName?: string;
  loginTime: number;
}

export interface FamilyConfig {
  familyName: string;
  setupComplete: boolean;
  passwordHash: string;
  memberPasswordHash?: string;
  createdAt: string;
}

export interface PersonalExpense {
  label: string;
  labelZh: string;
  amount: number;
}

export interface FamilyMember {
  id: string;
  // Basic info
  name: string;
  nameZh: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  relationship: 'self' | 'spouse' | 'child' | 'parent' | 'other';
  // Contact
  phone?: string;
  email?: string;
  avatarUrl?: string;
  // Identity
  jurisdiction: 'US' | 'HK' | 'both' | 'other';
  citizenship: string;
  taxResidency: string;
  // Career/Education
  occupation: string;
  employer: string;
  startDate: string;
  monthlySalary: number;
  // Life stage
  lifeStage: 'education' | 'career' | 'retirement';
  // Personal monthly fixed expenses
  personalExpenses: PersonalExpense[];
  // Meta
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdExpenseItem {
  label: string;
  labelZh: string;
  amount: number;
}

export interface HouseholdExpenses {
  monthly: HouseholdExpenseItem[];
  annualExpenses: HouseholdExpenseItem[];
  annualIncome: HouseholdExpenseItem[];
}

export interface Asset {
  id: string;
  category: 'cash' | 'investment' | 'retirement' | 'real_estate' | 'education' | 'insurance' | 'other';
  label: string;
  value: number;
  notes: string;
  // Real estate specific
  propertyAddress?: string;
  zestimate?: number;
  updatedAt: string;
}

export interface Liability {
  id: string;
  category: 'mortgage' | 'auto_loan' | 'credit_card' | 'student_loan' | 'other';
  label: string;
  value: number;
  notes: string;
  updatedAt: string;
}

export interface BankAccount {
  id: string;
  institution: string;
  accountType: 'checking' | 'savings' | 'brokerage' | 'retirement' | 'credit_card';
  balance: number;
  lastUpdated: string;
  notes: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

export interface FamilyData {
  config: FamilyConfig;
  members: FamilyMember[];
  expenses: HouseholdExpenses;
  assets: Asset[];
  liabilities: Liability[];
  accounts: BankAccount[];
  goals: Goal[];
}

// Default expense templates
export const DEFAULT_MONTHLY_EXPENSES: HouseholdExpenseItem[] = [
  { label: 'Water', labelZh: '水费', amount: 0 },
  { label: 'Electricity', labelZh: '电费', amount: 0 },
  { label: 'Gas', labelZh: '煤气', amount: 0 },
  { label: 'Internet', labelZh: '网络', amount: 0 },
  { label: 'Telecom', labelZh: '通讯', amount: 0 },
  { label: 'Auto Insurance', labelZh: '汽车保险', amount: 0 },
  { label: 'Home Insurance', labelZh: '房屋保险', amount: 0 },
  { label: 'Property Tax', labelZh: '地税（月均）', amount: 0 },
  { label: 'Landscaper', labelZh: '园艺', amount: 0 },
  { label: 'Mortgage', labelZh: '房贷', amount: 0 },
  { label: 'HOA', labelZh: 'HOA', amount: 0 },
  { label: 'Other', labelZh: '其他', amount: 0 },
];

export const DEFAULT_ANNUAL_EXPENSES: HouseholdExpenseItem[] = [
  { label: 'Travel/Vacation', labelZh: '旅游/度假', amount: 0 },
  { label: 'Vehicle Purchase', labelZh: '车辆购置', amount: 0 },
  { label: 'Home Maintenance', labelZh: '房产维修', amount: 0 },
  { label: 'Vehicle Maintenance', labelZh: '车辆维修', amount: 0 },
  { label: 'Other Annual Expenses', labelZh: '其他年度支出', amount: 0 },
];

export const DEFAULT_ANNUAL_INCOME: HouseholdExpenseItem[] = [
  { label: 'Investment Dividends', labelZh: '投资分红', amount: 0 },
  { label: 'Bonus', labelZh: '奖金', amount: 0 },
  { label: 'Other Annual Income', labelZh: '其他年度收入', amount: 0 },
];

export const DEFAULT_PERSONAL_EXPENSES: PersonalExpense[] = [
  { label: 'Subscriptions', labelZh: '订阅服务', amount: 0 },
  { label: 'Commute', labelZh: '通勤', amount: 0 },
  { label: 'Gas', labelZh: '加油', amount: 0 },
  { label: 'Phone/Telecom', labelZh: '手机/通讯', amount: 0 },
  { label: 'Personal Insurance', labelZh: '个人保险', amount: 0 },
  { label: 'Other Fixed', labelZh: '其他固定开销', amount: 0 },
];
