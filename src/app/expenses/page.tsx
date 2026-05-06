'use client';

import { useEffect, useState } from 'react';
import { loadExpenses, saveExpenses, loadMembers } from '@/lib/storage';
import { useAuth } from '@/lib/AuthContext';
import type { HouseholdExpenses, HouseholdExpenseItem, FamilyMember } from '@/lib/types';
import { DEFAULT_MONTHLY_EXPENSES, DEFAULT_ANNUAL_EXPENSES, DEFAULT_ANNUAL_INCOME } from '@/lib/types';

function fmt(v: number) {
  return `$${v.toLocaleString()}`;
}

function ExpenseSection({
  title,
  titleZh,
  items,
  onChange,
  readOnly,
}: {
  title: string;
  titleZh: string;
  items: HouseholdExpenseItem[];
  onChange: (index: number, amount: number) => void;
  readOnly: boolean;
}) {
  const total = items.reduce((s, e) => s + e.amount, 0);
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{titleZh}</h3>
          <p className="text-xs text-slate-400">{title}</p>
        </div>
        <span className="text-lg font-bold text-slate-800">{fmt(total)}</span>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <span className="text-sm text-slate-700">{item.labelZh}</span>
              <span className="text-xs text-slate-400 ml-2">{item.label}</span>
            </div>
            <div className="w-36">
              <input
                type="number"
                value={item.amount || ''}
                onChange={(e) => onChange(i, parseFloat(e.target.value) || 0)}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                min="0"
                step="10"
                placeholder="0"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const { session } = useAuth();
  const isAdmin = session?.role === 'admin';
  const [expenses, setExpenses] = useState<HouseholdExpenses>({
    monthly: [],
    annualExpenses: [],
    annualIncome: [],
  });
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const loaded = loadExpenses();
    // Ensure all default items are present
    const monthly = loaded.monthly.length > 0 ? loaded.monthly : DEFAULT_MONTHLY_EXPENSES.map((e) => ({ ...e }));
    const annualExpenses = loaded.annualExpenses.length > 0 ? loaded.annualExpenses : DEFAULT_ANNUAL_EXPENSES.map((e) => ({ ...e }));
    const annualIncome = loaded.annualIncome.length > 0 ? loaded.annualIncome : DEFAULT_ANNUAL_INCOME.map((e) => ({ ...e }));
    setExpenses({ monthly, annualExpenses, annualIncome });
    setMembers(loadMembers());
  }, []);

  const handleChange = (section: keyof HouseholdExpenses, index: number, amount: number) => {
    const updated = { ...expenses };
    updated[section] = [...updated[section]];
    updated[section][index] = { ...updated[section][index], amount };
    setExpenses(updated);
    setDirty(true);
  };

  const handleSave = () => {
    saveExpenses(expenses);
    setDirty(false);
  };

  const monthlyTotal = expenses.monthly.reduce((s, e) => s + e.amount, 0);
  const annualExpTotal = expenses.annualExpenses.reduce((s, e) => s + e.amount, 0);
  const annualIncTotal = expenses.annualIncome.reduce((s, e) => s + e.amount, 0);
  const totalMonthlySalary = members.reduce((s, m) => s + (m.monthlySalary || 0), 0);
  const totalPersonalExpenses = members.reduce((s, m) => s + (m.personalExpenses?.reduce((ss, e) => ss + e.amount, 0) || 0), 0);
  const effectiveMonthlyExpense = monthlyTotal + totalPersonalExpenses + (annualExpTotal / 12);
  const effectiveMonthlyIncome = totalMonthlySalary + (annualIncTotal / 12);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">收支管理</h2>
          <p className="text-sm text-slate-500 mt-1">Income & Expenses - 家庭收支全览</p>
        </div>
        {isAdmin && dirty && (
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            保存更改 / Save
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">月度收入</p>
          <p className="text-[10px] text-slate-400">Monthly Income</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{fmt(effectiveMonthlyIncome)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">月度支出</p>
          <p className="text-[10px] text-slate-400">Monthly Expenses</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{fmt(effectiveMonthlyExpense)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">月度结余</p>
          <p className="text-[10px] text-slate-400">Monthly Savings</p>
          <p className={`text-2xl font-bold mt-1 ${effectiveMonthlyIncome - effectiveMonthlyExpense >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {fmt(Math.round(effectiveMonthlyIncome - effectiveMonthlyExpense))}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">年度净额</p>
          <p className="text-[10px] text-slate-400">Annual Net</p>
          <p className={`text-2xl font-bold mt-1 ${(effectiveMonthlyIncome - effectiveMonthlyExpense) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {fmt(Math.round((effectiveMonthlyIncome - effectiveMonthlyExpense) * 12))}
          </p>
        </div>
      </div>

      {/* Monthly Household Expenses */}
      <ExpenseSection
        title="Monthly Household Expenses"
        titleZh="家庭月度固定开销"
        items={expenses.monthly}
        onChange={(i, amount) => handleChange('monthly', i, amount)}
        readOnly={!isAdmin}
      />

      <div className="grid grid-cols-2 gap-6">
        {/* Annual Expenses */}
        <ExpenseSection
          title="Annual One-time Expenses"
          titleZh="年度一次性支出"
          items={expenses.annualExpenses}
          onChange={(i, amount) => handleChange('annualExpenses', i, amount)}
          readOnly={!isAdmin}
        />

        {/* Annual Income */}
        <ExpenseSection
          title="Annual One-time Income"
          titleZh="年度一次性收入"
          items={expenses.annualIncome}
          onChange={(i, amount) => handleChange('annualIncome', i, amount)}
          readOnly={!isAdmin}
        />
      </div>

      {/* Income from Members */}
      {members.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">成员收入汇总 / Member Income Summary</h3>
          <div className="space-y-3">
            {members.filter((m) => m.monthlySalary > 0).map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {m.avatar}
                  </div>
                  <span className="text-sm text-slate-700">{m.name} {m.nameZh && `(${m.nameZh})`}</span>
                </div>
                <span className="text-sm font-medium text-green-600">{fmt(m.monthlySalary)}/月</span>
              </div>
            ))}
            {members.filter((m) => m.monthlySalary > 0).length === 0 && (
              <p className="text-sm text-slate-400 text-center py-2">暂无成员收入数据</p>
            )}
            <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-sm">
              <span className="text-slate-800">总月薪</span>
              <span className="text-green-600">{fmt(totalMonthlySalary)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
