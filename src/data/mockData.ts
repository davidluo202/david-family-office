export type AccessRole = 'family_admin' | 'adult_member' | 'dependent_member' | 'advisor_viewer';

export const accessRoles = [
  {
    id: 'family_admin' as AccessRole,
    label: 'Family Admin',
    desc: 'Can manage household profile, invite members, assign permissions, connect institutions, and approve AI action plans.',
    permissions: ['Manage family', 'Manage members', 'Assign roles', 'Connect accounts', 'View all finances', 'Export data'],
  },
  {
    id: 'adult_member' as AccessRole,
    label: 'Adult Member',
    desc: 'Can maintain own profile, income/expense records, goals, and any shared household data granted by admin.',
    permissions: ['Edit own profile', 'View shared household summary', 'Add personal cash flow', 'Upload tax forms'],
  },
  {
    id: 'dependent_member' as AccessRole,
    label: 'Dependent / Child',
    desc: 'Limited access for education-stage members; admin controls which profile fields or goals are visible.',
    permissions: ['Edit allowed profile fields', 'View assigned goals'],
  },
  {
    id: 'advisor_viewer' as AccessRole,
    label: 'Advisor Viewer',
    desc: 'Read-only access for CPA, insurance broker, estate attorney, or investment advisor; scoped by category and expiry date.',
    permissions: ['Read-only scoped access', 'No credential access', 'No money movement'],
  },
];

export const permissionMatrix = [
  { area: 'Household settings', admin: 'Full', adult: 'View', dependent: 'None', advisor: 'None' },
  { area: 'Member profiles', admin: 'Full', adult: 'Own + shared', dependent: 'Own limited', advisor: 'Scoped read' },
  { area: 'Bank / brokerage links', admin: 'Connect + remove', adult: 'Request / own', dependent: 'None', advisor: 'No credential access' },
  { area: 'Income & expenses', admin: 'Full', adult: 'Own + shared', dependent: 'Own limited', advisor: 'Scoped read' },
  { area: 'AI recommendations', admin: 'Approve / assign', adult: 'Comment', dependent: 'View assigned', advisor: 'Comment only' },
];

export const familyMembers: Array<{
  id: string;
  name: string;
  nameZh?: string;
  role: string;
  accessRole: AccessRole;
  dob?: string;
  gender?: string;
  status: string;
  relationship: string;
  jurisdiction: string;
  lifeStage: string;
  occupation?: string;
  organization?: string;
  startDate?: string;
  monthlyCompensation?: number;
  monthlyPersonalExpenses?: number;
  avatar: string;
}> = [];

export const memberProfileFields = [
  'Full legal name / preferred name',
  'Birth date',
  'Gender',
  'Relationship in family',
  'Current occupation',
  'Employer / school institution',
  'Employment / enrollment start date',
  'Monthly compensation or allowance',
  'Monthly fixed personal expenses',
  'Annual one-time income',
  'Annual one-time expenses',
];

export const personalExpenseCategories = [
  'Subscriptions',
  'Commute / transit',
  'Gas / fuel',
  'Mobile phone',
  'Personal insurance',
  'Meals outside household budget',
  'Education / books',
  'Other recurring personal spend',
];

export const householdExpenseCategories = [
  'Electricity / gas / water',
  'Internet',
  'Telecom / mobile family plan',
  'Auto insurance',
  'Home insurance',
  'Property tax',
  'Landscaper / gardening',
  'HOA / maintenance',
  'Groceries',
  'Healthcare',
  'Child education / activities',
  'Other shared household spend',
];

export const annualIncomeCategories = [
  'Investment dividends',
  'Interest income',
  'Bonus / commission',
  'RSU / equity vesting',
  'Rental true-up',
  'Tax refund',
  'Other one-time income',
];

export const annualExpenseCategories = [
  'Travel / vacation',
  'Vehicle purchase',
  'Home repair / renovation',
  'Vehicle repair',
  'Medical one-time expense',
  'Tuition / camp',
  'Tax payment',
  'Other one-time expense',
];

export const financialConnections = [
  {
    provider: 'Plaid / Finicity / Yodlee style aggregator',
    status: 'Planned',
    desc: 'Preferred US bank integration path. User completes institution login and MFA in a secure hosted flow; the app receives account/transaction tokens, not bank passwords.',
  },
  {
    provider: 'Direct institution OAuth / API',
    status: 'When available',
    desc: 'For banks or brokerages that provide official APIs. Use read-only scopes for balances and transactions.',
  },
  {
    provider: 'CSV / OFX / QFX import',
    status: 'Phase 1 fallback',
    desc: 'Manual upload for bank statements and credit card exports before API connection is approved.',
  },
  {
    provider: 'Tax form import',
    status: 'Planned',
    desc: 'Upload W-2, 1099-DIV, 1099-INT, 1099-B, K-1, 1098, property tax bills, and insurance notices to extract annual income/expense data.',
  },
];

// Robinhood portfolio — David's actual holdings (as of 2026-05-04)
// Total equity cost basis: $208,878 | Cash: $58,000 | Grand total: $266,878
export const robinhoodHoldings = [
  // Tech
  { symbol: 'ARKK',  name: 'ARK Innovation ETF',         category: 'Tech',         qty: 1100,        avgCost: 42.43,  costBasis: 46673   },
  { symbol: 'TSLA',  name: 'Tesla',                       category: 'Tech',         qty: 250,         avgCost: 203.35, costBasis: 50838   },
  { symbol: 'NVDA',  name: 'Nvidia',                      category: 'Tech',         qty: 165.067737,  avgCost: 127.81, costBasis: 21104   },
  { symbol: 'PLTR',  name: 'Palantir',                    category: 'Tech',         qty: 250,         avgCost: 31.38,  costBasis: 7845    },
  { symbol: 'TSM',   name: 'TSMC',                        category: 'Tech',         qty: 80,          avgCost: 110.50, costBasis: 8840    },
  { symbol: 'XLK',   name: 'Technology Select SPDR ETF',  category: 'Tech',         qty: 100,         avgCost: 116.00, costBasis: 11600   },
  // Fintech
  { symbol: 'SOFI',  name: 'SoFi Technologies',           category: 'Fintech',      qty: 200,         avgCost: 6.54,   costBasis: 1308    },
  { symbol: 'HOOD',  name: 'Robinhood Markets',           category: 'Fintech',      qty: 20,          avgCost: 105.06, costBasis: 2101    },
  // Space / Defense
  { symbol: 'RKLB',  name: 'Rocket Lab',                  category: 'Space/Defense',qty: 180,         avgCost: 41.50,  costBasis: 7470    },
  // Healthcare
  { symbol: 'ISRG',  name: 'Intuitive Surgical',          category: 'Healthcare',   qty: 5,           avgCost: 433.59, costBasis: 2168    },
  { symbol: 'HIMS',  name: 'Hims & Hers Health',          category: 'Healthcare',   qty: 300,         avgCost: 35.88,  costBasis: 10764   },
  // Crypto-related
  { symbol: 'IBIT',  name: 'iShares Bitcoin Trust ETF',   category: 'Crypto',       qty: 139.977603,  avgCost: 35.72,  costBasis: 4998    },
  { symbol: 'ARBK',  name: 'Argo Blockchain',             category: 'Crypto',       qty: 55.555556,   avgCost: 133.68, costBasis: 7427    },
  { symbol: 'CRWV',  name: 'CoreWeave',                   category: 'Crypto',       qty: 60,          avgCost: 101.09, costBasis: 6065    },
  // Mining
  { symbol: 'CDE',   name: 'Coeur Mining',                category: 'Mining',       qty: 60,          avgCost: 22.21,  costBasis: 1333    },
  // Other
  { symbol: 'NIO',   name: 'NIO Inc.',                    category: 'Other',        qty: 100,         avgCost: 7.52,   costBasis: 752     },
  { symbol: 'ONL',   name: 'Orion Office REIT',           category: 'Other',        qty: 20,          avgCost: 5.05,   costBasis: 101     },
  { symbol: 'VSAT',  name: 'Viasat',                      category: 'Other',        qty: 60,          avgCost: 15.16,  costBasis: 910     },
  { symbol: 'CRCL',  name: 'Circle Internet Group',       category: 'Other',        qty: 200,         avgCost: 83.91,  costBasis: 16782   },
];

export const robinhoodCash = 58_000;
// Sum of costBasis above = 208,878; total with cash = 266,878
export const robinhoodTotalCost = robinhoodHoldings.reduce((s, h) => s + h.costBasis, 0) + robinhoodCash;

export const assets = {
  cash: { label: 'Cash & Savings', value: 58_000 },  // Robinhood cash balance
  investments: {
    label: 'Investment Portfolio',
    value: 208_878,  // Robinhood equity cost basis
    breakdown: {
      // Legacy keys used by healthScore.ts — mapped to nearest equivalents
      stocks: 146_062,  // individual stocks (non-ETF) cost basis
      bonds:       0,
      etfs:     62_816,  // ARKK + XLK + IBIT cost basis
      // Category cost-basis totals
      tech:         146_900,  // ARKK+TSLA+NVDA+PLTR+TSM+XLK
      fintech:       3_409,   // SOFI+HOOD
      spaceDefense:  7_470,   // RKLB
      healthcare:   12_932,   // ISRG+HIMS
      crypto:       18_490,   // IBIT+ARBK+CRWV
      mining:        1_333,   // CDE
      other:        18_545,   // NIO+ONL+VSAT+CRCL
    },
  },
  retirement: {
    label: 'Retirement Accounts',
    value: 0,
    breakdown: { '401k': 0, roth_ira: 0, trad_ira: 0 },
  },
  realEstate: {
    label: 'Real Estate',
    value: 0,
    breakdown: { primary: 0, investment: 0 },
  },
  education: { label: 'Education (529)', value: 0 },
  insurance: { label: 'Insurance Cash Value', value: 0 },
  other: { label: 'Other Assets', value: 0 },
};

export const liabilities = {
  mortgage: { label: 'Mortgage', value: 0 },
  autoLoan: { label: 'Auto Loan', value: 0 },
  creditCards: { label: 'Credit Cards', value: 0 },
};

export const monthlyIncome = {
  salary: 0,
  rental: 0,
  investment: 0,
  business: 0,
};

export const monthlyExpenses = {
  housing: 0,
  food: 0,
  transport: 0,
  education: 0,
  insurance: 0,
  entertainment: 0,
  travel: 0,
  utilities: 0,
  healthcare: 0,
  other: 0,
};

export const goals = [
  { id: '1', name: 'Emergency Fund', target: 0, current: 0, deadline: 'Set by family admin', priority: 'high' as const },
  { id: '2', name: 'Education Funding', target: 0, current: 0, deadline: 'Set by member', priority: 'high' as const },
  { id: '3', name: 'Retirement Readiness', target: 0, current: 0, deadline: 'Set by family', priority: 'medium' as const },
];

export const risks = [
  { level: 'HIGH' as const, title: '成员资料未完整', desc: '请先邀请家庭成员并维护出生日期、关系、职业、收入与固定开销。' },
  { level: 'MEDIUM' as const, title: '权限模型待确认', desc: '需要指定Family Admin、一般成员、dependent成员和外部顾问的访问范围。' },
  { level: 'MEDIUM' as const, title: '金融账户未连接', desc: '银行/券商余额与交易暂未接入，当前应以手动录入或CSV/税表导入为主。' },
  { level: 'LOW' as const, title: '年度一次性项目待录入', desc: '旅游、车辆、房屋维修、分红、利息等需要年度预算模板。' },
];

export const actionItems = [
  { priority: 'critical' as const, action: '创建家庭空间并指定Family Admin', deadline: '本周', status: 'pending' as const },
  { priority: 'warning' as const, action: '邀请成员注册并维护个人资料', deadline: '本周', status: 'pending' as const },
  { priority: 'warning' as const, action: '建立家庭固定开销分类模板', deadline: '下周', status: 'pending' as const },
  { priority: 'info' as const, action: '选择银行聚合API供应商并验证MFA流程', deadline: 'Phase 1.1', status: 'pending' as const },
  { priority: 'info' as const, action: '设计税表导入字段映射', deadline: 'Phase 1.1', status: 'in_progress' as const },
];

export const netWorthHistory = [
  { month: 'Jun 25', value: 0 }, { month: 'Jul 25', value: 0 }, { month: 'Aug 25', value: 0 },
  { month: 'Sep 25', value: 0 }, { month: 'Oct 25', value: 0 }, { month: 'Nov 25', value: 0 },
  { month: 'Dec 25', value: 0 }, { month: 'Jan 26', value: 0 }, { month: 'Feb 26', value: 0 },
  { month: 'Mar 26', value: 0 }, { month: 'Apr 26', value: 0 }, { month: 'May 26', value: 0 },
];

export const cashFlowHistory = [
  { month: 'Jun 25', income: 0, expenses: 0, savings: 0 }, { month: 'Jul 25', income: 0, expenses: 0, savings: 0 },
  { month: 'Aug 25', income: 0, expenses: 0, savings: 0 }, { month: 'Sep 25', income: 0, expenses: 0, savings: 0 },
  { month: 'Oct 25', income: 0, expenses: 0, savings: 0 }, { month: 'Nov 25', income: 0, expenses: 0, savings: 0 },
  { month: 'Dec 25', income: 0, expenses: 0, savings: 0 }, { month: 'Jan 26', income: 0, expenses: 0, savings: 0 },
  { month: 'Feb 26', income: 0, expenses: 0, savings: 0 }, { month: 'Mar 26', income: 0, expenses: 0, savings: 0 },
  { month: 'Apr 26', income: 0, expenses: 0, savings: 0 }, { month: 'May 26', income: 0, expenses: 0, savings: 0 },
];

export const aiRecommendations = [
  {
    category: '成员与权限',
    message: '先完成家庭空间创建、成员邀请、Family Admin设置和权限矩阵确认。系统默认不预设具体家庭成员。',
  },
  {
    category: '现金流采集',
    message: '把每位成员的月度薪酬、固定个人开销、家庭公共开销责任和年度一次性收支分开录入，避免家庭预算与个人预算混在一起。',
  },
  {
    category: '银行连接',
    message: '美国银行数据建议优先使用Plaid/Finicity/Yodlee等聚合API或官方OAuth，不在本系统保存银行登录密码；MFA在供应商安全页面完成。',
  },
  {
    category: '税表导入',
    message: '支持上传W-2、1099、K-1、1098、property tax bill等文件，先提取年度收入/支出字段，再进入税务规划模块。',
  },
];

export const upcomingEvents = [
  { date: '2026-05-10', title: '完成家庭空间初始化', type: 'review' },
  { date: '2026-05-15', title: '邀请成员注册登录', type: 'education' },
  { date: '2026-06-01', title: '确认银行API/导入方案', type: 'investment' },
  { date: '2026-06-15', title: '税表导入字段评审', type: 'tax' },
];
