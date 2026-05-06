'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import { monthlyIncome, monthlyExpenses, cashFlowHistory } from '@/data/mockData';
import { getMonthlySavings, getSavingsRate } from '@/lib/healthScore';

const EXPENSE_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#6b7280'];

function fmt(v: number) {
  return `$${v.toLocaleString()}`;
}

export default function CashFlowPage() {
  const totalIncome = Object.values(monthlyIncome).reduce((a, b) => a + b, 0);
  const totalExpenses = Object.values(monthlyExpenses).reduce((a, b) => a + b, 0);
  const savings = getMonthlySavings();
  const savingsRate = getSavingsRate();

  const expenseData = Object.entries(monthlyExpenses).map(([key, value], i) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    color: EXPENSE_COLORS[i % EXPENSE_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Cash Flow</h2>
        <p className="text-sm text-slate-500 mt-1">Monthly income, expenses, and savings analysis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">Monthly Income</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{fmt(totalIncome)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">Monthly Expenses</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{fmt(totalExpenses)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">Net Savings</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{fmt(savings)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">Savings Rate</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{savingsRate}%</p>
        </div>
      </div>

      {/* Cash Flow Trend */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Cash Flow Projection (12 Months)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlowHistory} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                formatter={(value) => `$${Number(value).toLocaleString()}`}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="savings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Income Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Income Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(monthlyIncome).map(([key, value]) => {
              const pct = Math.round((value / totalIncome) * 100);
              return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600 capitalize">{key}</span>
                    <span className="text-sm font-medium text-slate-700">{fmt(value)} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="pt-3 border-t border-slate-100 flex justify-between">
              <span className="text-sm font-bold text-slate-800">Total</span>
              <span className="text-sm font-bold text-green-600">{fmt(totalIncome)}</span>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Expense Breakdown</h3>
          <div className="flex items-center gap-4">
            <div className="w-40 h-40 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={1} dataKey="value">
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `$${Number(value).toLocaleString()}`}
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1">
              {expenseData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 flex-1">{item.name}</span>
                  <span className="text-slate-500 font-medium">{fmt(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
