export const familyMembers = [
  {
    id: '1',
    name: 'David Luo',
    nameZh: '罗新涛',
    role: 'primary',
    dob: '1975-03-15',
    status: 'active',
    jurisdiction: 'both',
    lifeStage: 'career',
    occupation: 'CEO, Canton Mutual Financial',
    avatar: 'DL',
  },
  {
    id: '2',
    name: 'Wife',
    nameZh: '范氏',
    role: 'spouse',
    dob: '1978-06-20',
    status: 'active',
    jurisdiction: 'US',
    lifeStage: 'career',
    occupation: 'Homemaker',
    avatar: 'FS',
  },
  {
    id: '3',
    name: 'Derui Luo',
    nameZh: '罗德瑞',
    role: 'child',
    dob: '2005-08-10',
    status: 'active',
    jurisdiction: 'US',
    lifeStage: 'education',
    educationStage: 'university',
    occupation: 'University Student',
    avatar: 'DR',
  },
  {
    id: '4',
    name: 'Dexin Luo',
    nameZh: '罗德馨',
    role: 'child',
    dob: '2010-11-25',
    status: 'active',
    jurisdiction: 'US',
    lifeStage: 'education',
    educationStage: 'high_school',
    occupation: 'High School Student',
    avatar: 'DX',
  },
];

export const assets = {
  cash: { label: 'Cash & Savings', value: 250000 },
  investments: {
    label: 'Investment Portfolio',
    value: 680000,
    breakdown: { stocks: 450000, bonds: 150000, etfs: 80000 },
  },
  retirement: {
    label: 'Retirement Accounts',
    value: 520000,
    breakdown: { '401k': 350000, roth_ira: 120000, trad_ira: 50000 },
  },
  realEstate: {
    label: 'Real Estate',
    value: 1200000,
    breakdown: { primary: 850000, investment: 350000 },
  },
  education: { label: 'Education (529)', value: 85000 },
  insurance: { label: 'Insurance Cash Value', value: 45000 },
  other: { label: 'Other Assets', value: 30000 },
};

export const liabilities = {
  mortgage: { label: 'Mortgage', value: 580000 },
  autoLoan: { label: 'Auto Loan', value: 25000 },
  creditCards: { label: 'Credit Cards', value: 8000 },
};

export const monthlyIncome = {
  salary: 25000,
  rental: 3500,
  investment: 1200,
  business: 5000,
};

export const monthlyExpenses = {
  housing: 4500,
  food: 1800,
  transport: 800,
  education: 2000,
  insurance: 1500,
  entertainment: 1000,
  travel: 500,
  utilities: 400,
  healthcare: 600,
  other: 900,
};

export const goals = [
  { id: '1', name: 'Emergency Fund', target: 180000, current: 250000, deadline: 'Ongoing', priority: 'high' as const },
  { id: '2', name: 'Derui College Fund', target: 200000, current: 85000, deadline: '2027', priority: 'high' as const },
  { id: '3', name: 'Retirement by 60', target: 3000000, current: 1200000, deadline: '2035', priority: 'medium' as const },
  { id: '4', name: 'Pay Off Mortgage', target: 580000, current: 0, deadline: '2045', priority: 'medium' as const },
  { id: '5', name: 'Investment Property #2', target: 500000, current: 120000, deadline: '2028', priority: 'low' as const },
];

export const risks = [
  { level: 'HIGH' as const, title: '保险覆盖不足', desc: '人寿保险保额可能不足以覆盖家庭10年开支' },
  { level: 'MEDIUM' as const, title: '投资集中度', desc: '股票投资占比偏高(66%)，建议增加债券和另类配置' },
  { level: 'MEDIUM' as const, title: '税务优化空间', desc: 'Roth Conversion窗口期，建议在低收入年度转换' },
  { level: 'LOW' as const, title: '遗产规划待完善', desc: '信托和遗嘱需要更新' },
  { level: 'LOW' as const, title: '教育基金缺口', desc: '529计划目标差距约$115K，需加速储蓄' },
];

export const actionItems = [
  { priority: 'critical' as const, action: '审查人寿保险保额', deadline: '本月', status: 'pending' as const },
  { priority: 'warning' as const, action: '咨询CPA关于Roth Conversion', deadline: '本季度', status: 'pending' as const },
  { priority: 'warning' as const, action: '增加529月供至$1,500', deadline: '下月', status: 'pending' as const },
  { priority: 'info' as const, action: '更新遗嘱受益人', deadline: '本季度', status: 'pending' as const },
  { priority: 'info' as const, action: '房产投资市场调研', deadline: '2026 Q3', status: 'in_progress' as const },
];

export const netWorthHistory = [
  { month: 'Jun 25', value: 2050000 },
  { month: 'Jul 25', value: 2080000 },
  { month: 'Aug 25', value: 2020000 },
  { month: 'Sep 25', value: 2100000 },
  { month: 'Oct 25', value: 2130000 },
  { month: 'Nov 25', value: 2090000 },
  { month: 'Dec 25', value: 2150000 },
  { month: 'Jan 26', value: 2120000 },
  { month: 'Feb 26', value: 2160000 },
  { month: 'Mar 26', value: 2180000 },
  { month: 'Apr 26', value: 2170000 },
  { month: 'May 26', value: 2197000 },
];

export const cashFlowHistory = [
  { month: 'Jun 25', income: 34700, expenses: 14000, savings: 20700 },
  { month: 'Jul 25', income: 34700, expenses: 15200, savings: 19500 },
  { month: 'Aug 25', income: 34700, expenses: 13800, savings: 20900 },
  { month: 'Sep 25', income: 34700, expenses: 16000, savings: 18700 },
  { month: 'Oct 25', income: 34700, expenses: 14500, savings: 20200 },
  { month: 'Nov 25', income: 34700, expenses: 13200, savings: 21500 },
  { month: 'Dec 25', income: 34700, expenses: 18000, savings: 16700 },
  { month: 'Jan 26', income: 34700, expenses: 14000, savings: 20700 },
  { month: 'Feb 26', income: 34700, expenses: 13500, savings: 21200 },
  { month: 'Mar 26', income: 34700, expenses: 14200, savings: 20500 },
  { month: 'Apr 26', income: 34700, expenses: 13800, savings: 20900 },
  { month: 'May 26', income: 34700, expenses: 14000, savings: 20700 },
];

export const aiRecommendations = [
  {
    category: '保险优化',
    message: '建议将人寿保险保额提升至年收入的10-12倍（约$350-420万），当前保额可能不足。可考虑Term Life + Whole Life组合策略。',
  },
  {
    category: '税务规划',
    message: '2026年是Roth Conversion的好时机。建议在收入较低的季度分批转换Traditional IRA余额，预计可节省长期税负$15-20K。',
  },
  {
    category: '教育基金',
    message: 'Derui 2027年入学，529缺口约$115K。建议月供从$800增至$1,500，同时考虑Coverdell ESA作为补充。',
  },
  {
    category: '投资组合',
    message: '当前股票占比66%偏高。建议调整为: 股票55%、债券25%、REITs 10%、现金10%，降低波动风险。',
  },
  {
    category: '房产投资',
    message: '第二套投资房产目标$500K，已积累$120K首付。建议关注Austin/Raleigh市场，预计2027Q1可达成20%首付门槛。',
  },
];

export const upcomingEvents = [
  { date: '2026-05-10', title: '保险续保审查', type: 'insurance' },
  { date: '2026-05-15', title: '季度投资组合再平衡', type: 'investment' },
  { date: '2026-06-01', title: 'CPA税务咨询', type: 'tax' },
  { date: '2026-06-15', title: '529供款增额生效', type: 'education' },
  { date: '2026-07-01', title: '半年度财务回顾', type: 'review' },
];
