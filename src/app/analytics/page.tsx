'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { loadAssets, loadLiabilities, loadExpenses, loadMembers } from '@/lib/storage';

type Period = 'month' | 'quarter' | 'year';

interface DataPoint {
  label: string;
  assets: number;
  liabilities: number;
  netWorth: number;
  income: number;
  expenses: number;
}

function fmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

function generateHistoricalData(
  currentAssets: number,
  currentLiabilities: number,
  currentIncome: number,
  currentExpenses: number,
  period: Period
): DataPoint[] {
  const points: DataPoint[] = [];
  const count = period === 'month' ? 12 : period === 'quarter' ? 8 : 5;

  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    let label = '';

    if (period === 'month') {
      d.setMonth(d.getMonth() - i);
      label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    } else if (period === 'quarter') {
      d.setMonth(d.getMonth() - i * 3);
      const q = Math.floor(d.getMonth() / 3) + 1;
      label = `Q${q} ${d.getFullYear().toString().slice(2)}`;
    } else {
      d.setFullYear(d.getFullYear() - i);
      label = d.getFullYear().toString();
    }

    // Growth factor: older data is slightly lower with some variance
    const growthFactor = 1 - (i / count) * 0.3 + (Math.sin(i * 1.7) * 0.03);
    const expFactor = 1 - (i / count) * 0.15 + (Math.cos(i * 2.3) * 0.02);
    const incFactor = 1 - (i / count) * 0.2 + (Math.sin(i * 1.1) * 0.025);

    const assets = Math.round(currentAssets * growthFactor);
    const liabilities = Math.round(currentLiabilities * (1 - (i / count) * 0.1));

    points.push({
      label,
      assets,
      liabilities,
      netWorth: assets - liabilities,
      income: Math.round(currentIncome * incFactor),
      expenses: Math.round(currentExpenses * expFactor),
    });
  }

  return points;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs">
        <p className="font-semibold text-slate-800 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {fmt(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    const assets = loadAssets();
    const liabilities = loadLiabilities();
    const expenses = loadExpenses();
    const members = loadMembers();

    const totalAssets = assets.reduce((s, a) => s + a.value, 0);
    const totalLiabilities = liabilities.reduce((s, l) => s + l.value, 0);

    const monthlyIncome = members.reduce((s, m) => s + m.monthlySalary, 0);
    const annualIncome = expenses.annualIncome?.reduce((s, i) => s + i.amount, 0) || 0;
    const totalMonthlyIncome = monthlyIncome + annualIncome / 12;

    const monthlyExpenses = expenses.monthly?.reduce((s, e) => s + e.amount, 0) || 0;
    const annualExpenses = expenses.annualExpenses?.reduce((s, e) => s + e.amount, 0) || 0;
    const personalExpenses = members.reduce(
      (s, m) => s + (m.personalExpenses?.reduce((ps, pe) => ps + pe.amount, 0) || 0),
      0
    );
    const totalMonthlyExpenses = monthlyExpenses + annualExpenses / 12 + personalExpenses;

    setData(
      generateHistoricalData(
        totalAssets || 500000,
        totalLiabilities || 200000,
        totalMonthlyIncome || 8000,
        totalMonthlyExpenses || 5000,
        period
      )
    );
  }, [period]);

  const latest = data[data.length - 1];

  const statCards = latest
    ? [
        { label: '净资产 Net Worth', value: fmt(latest.netWorth), color: 'text-blue-600' },
        { label: '总资产 Assets', value: fmt(latest.assets), color: 'text-green-600' },
        { label: '月收入 Income', value: fmt(latest.income), color: 'text-emerald-600' },
        { label: '月支出 Expenses', value: fmt(latest.expenses), color: 'text-red-500' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">趋势分析</h2>
          <p className="text-sm text-slate-500 mt-1">Analytics - 财务趋势图表</p>
        </div>
        <div className="flex gap-2">
          {(['month', 'quarter', 'year'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p === 'month' ? '月度' : p === 'quarter' ? '季度' : '年度'}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-500">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Net Worth Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-base font-semibold text-slate-800 mb-4">净资产趋势 / Net Worth Trend</h3>
        <div className="w-full overflow-x-auto">
          <div style={{ minWidth: 320 }}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: '#94a3b8' }} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="netWorth" name="净资产" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="assets" name="总资产" stroke="#22c55e" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="liabilities" name="总负债" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Income vs Expenses Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-base font-semibold text-slate-800 mb-4">收支趋势 / Income vs Expenses</h3>
        <div className="w-full overflow-x-auto">
          <div style={{ minWidth: 320 }}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: '#94a3b8' }} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="income" name="收入" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="expenses" name="支出" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3">* 图表基于当前数据推算历史趋势 / Charts show estimated historical trend based on current values</p>
      </div>
    </div>
  );
}
