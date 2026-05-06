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

function safeRatio(numerator: number, denominator: number, fallback = 0): number {
  if (!Number.isFinite(denominator) || denominator <= 0) return fallback;
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : fallback;
}

function clampScore(score: number, max: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(max, Math.round(score)));
}

function statusFromRatio(score: number, max: number): 'excellent' | 'good' | 'fair' | 'poor' {
  const ratio = safeRatio(score, max);
  if (ratio >= 0.85) return 'excellent';
  if (ratio >= 0.65) return 'good';
  if (ratio >= 0.4) return 'fair';
  return 'poor';
}

export function calculateHealthScore(): { total: number; dimensions: ScoreDimension[] } {
  const totalExpenses = calcTotalExpenses();
  const totalAssets = calcTotalAssets();
  const cashReserve = assets.cash.value;
  const emergencyMonths = safeRatio(cashReserve, totalExpenses);

  const liquidityScore = clampScore(safeRatio(emergencyMonths, 6) * 15, 15);
  const growthScore = totalAssets > 0 ? 8 : 0;
  const debtToAsset = safeRatio(calcTotalLiabilities(), totalAssets);
  const debtScore = totalAssets > 0 ? clampScore((1 - debtToAsset) * 10 * 1.2, 10) : 0;

  const inv = assets.investments.breakdown;
  const totalInv = inv ? inv.stocks + inv.bonds + inv.etfs : 0;
  const stockConcentration = inv ? safeRatio(inv.stocks, totalInv, 1) : 1;
  const divScore = totalInv <= 0 ? 0 : stockConcentration > 0.7 ? 8 : stockConcentration > 0.5 ? 11 : 15;

  const insuranceScore = assets.insurance.value > 0 ? 5 : 0;
  const retirementRatio = safeRatio(assets.retirement.value, totalAssets);
  const taxScore = clampScore(retirementRatio * 40, 10);

  const retirementTarget = 3000000;
  const retirementCurrent = assets.retirement.value + assets.investments.value;
  const retirementProgress = safeRatio(retirementCurrent, retirementTarget);
  const retirementScore = clampScore(retirementProgress * 15, 15);
  const estateScore = 0;

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
  return Math.round(safeRatio(assets.cash.value, totalExpenses) * 10) / 10;
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
  return Math.round(safeRatio(savings, income) * 100);
}
