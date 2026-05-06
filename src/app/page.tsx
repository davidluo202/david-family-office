'use client';

import { useEffect, useState } from 'react';
import { loadMembers, loadAssets, loadLiabilities, loadExpenses, loadGoals, loadConfig } from '@/lib/storage';
import type { FamilyMember, Asset, Liability, HouseholdExpenses, Goal } from '@/lib/types';
import Link from 'next/link';

function fmt(v: number) {
  return `$${v.toLocaleString()}`;
}

function StatCard({ label, labelZh, value, sub, color }: { label: string; labelZh: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
      <p className="text-sm text-slate-500 font-medium">{labelZh}</p>
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || 'text-slate-800'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [expenses, setExpenses] = useState<HouseholdExpenses>({ monthly: [], annualExpenses: [], annualIncome: [] });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [familyName, setFamilyName] = useState('');

  useEffect(() => {
    setMembers(loadMembers());
    setAssets(loadAssets());
    setLiabilities(loadLiabilities());
    setExpenses(loadExpenses());
    setGoals(loadGoals());
    const config = loadConfig();
    if (config) setFamilyName(config.familyName);
  }, []);

  const totalAssets = assets.reduce((s, a) => s + a.value, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.value, 0);
  const netWorth = totalAssets - totalLiabilities;
  const monthlyExpenses = expenses.monthly.reduce((s, e) => s + e.amount, 0);
  const totalMonthlySalary = members.reduce((s, m) => s + (m.monthlySalary || 0), 0);
  const monthlySavings = totalMonthlySalary - monthlyExpenses;
  const savingsRate = totalMonthlySalary > 0 ? Math.round((monthlySavings / totalMonthlySalary) * 100) : 0;
  const adults = members.filter((m) => m.relationship === 'self' || m.relationship === 'spouse' || m.relationship === 'parent').length;
  const children = members.filter((m) => m.relationship === 'child').length;

  const isEmpty = members.length === 0 && assets.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          {familyName ? `${familyName} - 仪表盘` : '仪表盘'}
        </h2>
        <p className="text-sm text-slate-500 mt-1">Command Center - 家庭财务总览</p>
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-100 text-center">
          <div className="text-5xl mb-4">&#x1F3E0;</div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">欢迎来到 Mini Family Office</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            开始添加家庭成员、资产和支出信息，构建您的家庭财务全景。
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/family" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              添加家庭成员
            </Link>
            <Link href="/wealth" className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
              管理资产
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              label="Net Worth"
              labelZh="净资产"
              value={fmt(netWorth)}
              color="text-blue-600"
            />
            <StatCard
              label="Monthly Cash Flow"
              labelZh="月度现金流"
              value={monthlySavings >= 0 ? `+${fmt(monthlySavings)}` : fmt(monthlySavings)}
              sub={totalMonthlySalary > 0 ? `${savingsRate}% 储蓄率` : undefined}
              color={monthlySavings >= 0 ? 'text-green-600' : 'text-red-500'}
            />
            <StatCard
              label="Total Assets"
              labelZh="总资产"
              value={fmt(totalAssets)}
              color="text-emerald-600"
            />
            <StatCard
              label="Family Members"
              labelZh="家庭成员"
              value={`${members.length}`}
              sub={`${adults} 成人, ${children} 子女`}
            />
          </div>

          {/* Quick Overview Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Assets Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">资产概况 / Assets</h3>
              {assets.length > 0 ? (
                <div className="space-y-2">
                  {assets.slice(0, 5).map((a) => (
                    <div key={a.id} className="flex justify-between text-sm">
                      <span className="text-slate-600">{a.label}</span>
                      <span className="font-medium text-slate-800">{fmt(a.value)}</span>
                    </div>
                  ))}
                  {assets.length > 5 && (
                    <p className="text-xs text-slate-400">+{assets.length - 5} more...</p>
                  )}
                  <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-sm">
                    <span className="text-slate-800">总计</span>
                    <span className="text-green-600">{fmt(totalAssets)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-400">暂无资产数据</p>
                  <Link href="/wealth" className="text-xs text-blue-600 hover:text-blue-700">添加资产</Link>
                </div>
              )}
            </div>

            {/* Goals Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">目标进度 / Goals</h3>
              {goals.length > 0 ? (
                <div className="space-y-3">
                  {goals.slice(0, 4).map((goal) => {
                    const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
                    return (
                      <div key={goal.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">{goal.name}</span>
                          <span className="text-slate-500">{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full">
                          <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-400">暂无目标</p>
                  <Link href="/goals" className="text-xs text-blue-600 hover:text-blue-700">设置目标</Link>
                </div>
              )}
            </div>

            {/* Monthly Expenses Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">月度支出 / Expenses</h3>
              {expenses.monthly.filter((e) => e.amount > 0).length > 0 ? (
                <div className="space-y-2">
                  {expenses.monthly.filter((e) => e.amount > 0).slice(0, 5).map((e, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-600">{e.labelZh}</span>
                      <span className="font-medium text-slate-800">{fmt(e.amount)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-sm">
                    <span className="text-slate-800">月度总计</span>
                    <span className="text-red-500">{fmt(monthlyExpenses)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-400">暂无支出数据</p>
                  <Link href="/expenses" className="text-xs text-blue-600 hover:text-blue-700">录入支出</Link>
                </div>
              )}
            </div>
          </div>

          {/* Members Overview */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">家庭成员 / Family</h3>
            <div className="grid grid-cols-4 gap-4">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {m.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{m.name}</p>
                    {m.nameZh && <p className="text-xs text-slate-400">{m.nameZh}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
