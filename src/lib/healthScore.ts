import { assets, liabilities, monthlyIncome, monthlyExpenses } from '@/data/mockData';

interface ScoreDimension {
  name: string;
  nameZh: string;
  maxPoints: number;
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

function calcTotalAssets(): number {
  return Object.values(assets).reduce((sum, a) => sum + a.value, 0);
}

function calcTotalLiabilities(): number {
  return Object.values(liabilities).reduce((sum, l) => sum + l.value, 0);
}

function calcTotalIncome(): number {
  return Object.values(monthlyIncome).reduce((a, b) => a + b, 0);
}

function calcTotalExpenses(): number {
  return Object.values(monthlyExpenses).reduce((a, b) => a + b, 0);
}

function statusFromRatio(score: number, max: number): 'excellent' | 'good' | 'fair' | 'poor' {
  const ratio = score / max;
  if (ratio >= 0.85) return 'excellent';
  if (ratio >= 0.65) return 'good';
  if (ratio >= 0.4) return 'fair';
  return 'poor';
}

export function calculateHealthScore(): { total: number; dimensions: ScoreDimension[] } {
  const totalExpenses = calcTotalExpenses();
  const cashReserve = assets.cash.value;
  const emergencyMonths = cashReserve / totalExpenses;

  // 1. Liquidity (15 pts) - 6+ months = full score
  const liquidityScore = Math.min(15, Math.round((emergencyMonths / 6) * 15));

  // 2. Asset Growth YoY (15 pts) - mock 8% growth
  const yoyGrowth = 0.08;
  const growthScore = Math.min(15, Math.round((yoyGrowth / 0.1) * 15));

  // 3. Debt Management (10 pts) - debt-to-asset ratio
  const debtToAsset = calcTotalLiabilities() / calcTotalAssets();
  const debtScore = Math.min(10, Math.round((1 - debtToAsset) * 10 * 1.2));

  // 4. Investment Diversification (15 pts)
  const inv = assets.investments.breakdown;
  const totalInv = inv ? inv.stocks + inv.bonds + inv.etfs : 0;
  const stockConcentration = inv ? inv.stocks / totalInv : 1;
  const divScore = stockConcentration > 0.7 ? 8 : stockConcentration > 0.5 ? 11 : 15;

  // 5. Insurance Coverage (10 pts) - mock: partially covered
  const insuranceScore = 5;

  // 6. Tax Efficiency (10 pts) - has retirement accounts, some optimization
  const retirementRatio = assets.retirement.value / calcTotalAssets();
  const taxScore = Math.min(10, Math.round(retirementRatio * 40));

  // 7. Retirement Readiness (15 pts)
  const retirementTarget = 3000000;
  const retirementCurrent = assets.retirement.value + assets.investments.value;
  const retirementProgress = retirementCurrent / retirementTarget;
  const retirementScore = Math.min(15, Math.round(retirementProgress * 15));

  // 8. Estate Planning (10 pts) - mock: needs work
  const estateScore = 4;

  const dimensions: ScoreDimension[] = [
    { name: 'Liquidity', nameZh: '流动性', maxPoints: 15, score: liquidityScore, status: statusFromRatio(liquidityScore, 15) },
    { name: 'Asset Growth', nameZh: '资产增长', maxPoints: 15, score: growthScore, status: statusFromRatio(growthScore, 15) },
    { name: 'Debt Management', nameZh: '债务管理', maxPoints: 10, score: debtScore, status: statusFromRatio(debtScore, 10) },
    { name: 'Diversification', nameZh: '投资多元化', maxPoints: 15, score: divScore, status: statusFromRatio(divScore, 15) },
    { name: 'Insurance', nameZh: '保险覆盖', maxPoints: 10, score: insuranceScore, status: statusFromRatio(insuranceScore, 10) },
    { name: 'Tax Efficiency', nameZh: '税务效率', maxPoints: 10, score: taxScore, status: statusFromRatio(taxScore, 10) },
    { name: 'Retirement', nameZh: '退休准备', maxPoints: 15, score: retirementScore, status: statusFromRatio(retirementScore, 15) },
    { name: 'Estate Plan', nameZh: '遗产规划', maxPoints: 10, score: estateScore, status: statusFromRatio(estateScore, 10) },
  ];

  const total = dimensions.reduce((sum, d) => sum + d.score, 0);

  return { total, dimensions };
}

export function getEmergencyMonths(): number {
  const totalExpenses = calcTotalExpenses();
  return Math.round((assets.cash.value / totalExpenses) * 10) / 10;
}

export function getNetWorth(): number {
  return calcTotalAssets() - calcTotalLiabilities();
}

export function getTotalAssets(): number {
  return calcTotalAssets();
}

export function getTotalLiabilities(): number {
  return calcTotalLiabilities();
}

export function getMonthlySavings(): number {
  return calcTotalIncome() - calcTotalExpenses();
}

export function getSavingsRate(): number {
  const income = calcTotalIncome();
  const savings = income - calcTotalExpenses();
  return Math.round((savings / income) * 100);
}
