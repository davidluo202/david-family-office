'use client';

import { useEffect, useState } from 'react';
import { loadMembers, loadAssets, loadLiabilities, loadExpenses, loadGoals, loadConfig } from '@/lib/storage';
import type { FamilyMember, Asset, Liability, HouseholdExpenses, Goal } from '@/lib/types';
import { robinhoodHoldings, robinhoodCash, robinhoodTotalCost } from '@/data/mockData';
import { useLanguage } from '@/lib/i18n';
import { APP_VERSION } from '@/lib/version';
import Link from 'next/link';

function fmt(v: number) {
  return `$${v.toLocaleString()}`;
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
      <p className="text-sm text-slate-500 font-medium">{label}</p>
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

  const manualAssets = assets.reduce((s, a) => s + a.value, 0);
  const totalAssets = manualAssets + robinhoodTotalCost;
  const totalLiabilities = liabilities.reduce((s, l) => s + l.value, 0);
  const netWorth = totalAssets - totalLiabilities;
  const monthlyExpenses = expenses.monthly.reduce((s, e) => s + e.amount, 0);
  const totalMonthlySalary = members.reduce((s, m) => s + (m.monthlySalary || 0), 0);
  const monthlySavings = totalMonthlySalary - monthlyExpenses;
  const savingsRate = totalMonthlySalary > 0 ? Math.round((monthlySavings / totalMonthlySalary) * 100) : 0;
  const adults = members.filter((m) => m.relationship === 'self' || m.relationship === 'spouse' || m.relationship === 'parent').length;
  const children = members.filter((m) => m.relationship === 'child').length;
  const { t } = useLanguage();

  const isEmpty = members.length === 0 && assets.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {familyName ? `${familyName} - ${t('dashboard.title')}` : t('dashboard.title')}
          </h2>
          <p className="text-sm text-slate-500 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <span className="text-xs text-slate-400">v{APP_VERSION}</span>
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-100 text-center">
          <div className="text-5xl mb-4">&#x1F3E0;</div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">{t('dashboard.welcome')}</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            {t('dashboard.welcomeDesc')}
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/family" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              {t('dashboard.addMembers')}
            </Link>
            <Link href="/wealth" className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
              {t('dashboard.manageAssets')}
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={t('stat.netWorth')}
              value={fmt(netWorth)}
              color="text-blue-600"
            />
            <StatCard
              label={t('stat.monthlyCashFlow')}
              value={monthlySavings >= 0 ? `+${fmt(monthlySavings)}` : fmt(monthlySavings)}
              sub={totalMonthlySalary > 0 ? `${savingsRate}% ${t('stat.savingsRate')}` : undefined}
              color={monthlySavings >= 0 ? 'text-green-600' : 'text-red-500'}
            />
            <StatCard
              label={t('stat.totalAssets')}
              value={fmt(totalAssets)}
              color="text-emerald-600"
            />
            <StatCard
              label={t('stat.familyMembers')}
              value={`${members.length}`}
              sub={`${adults} ${t('stat.adults')}, ${children} ${t('stat.children')}`}
            />
          </div>

          {/* Robinhood Portfolio Quick View */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{t('section.portfolio')} / Robinhood</h3>
              <Link href="/portfolio" className="text-xs text-blue-600 hover:text-blue-700">{t('section.viewDetails')} &rarr;</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-400">Cost Basis</p>
                <p className="text-lg font-bold text-slate-800">{fmt(robinhoodTotalCost)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Equity</p>
                <p className="text-lg font-bold text-slate-800">{fmt(robinhoodTotalCost - robinhoodCash)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Cash</p>
                <p className="text-lg font-bold text-slate-800">{fmt(robinhoodCash)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Positions</p>
                <p className="text-lg font-bold text-slate-800">{robinhoodHoldings.length}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {robinhoodHoldings.slice(0, 10).map((h) => (
                <span key={h.symbol} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                  {h.symbol}
                </span>
              ))}
              {robinhoodHoldings.length > 10 && (
                <span className="text-[10px] px-1.5 py-0.5 text-slate-400">+{robinhoodHoldings.length - 10} more</span>
              )}
            </div>
          </div>

          {/* Quick Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Assets Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">{t('section.assets')}</h3>
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
                    <span className="text-slate-800">{t('section.total')}</span>
                    <span className="text-green-600">{fmt(totalAssets)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-400">{t('empty.noAssets')}</p>
                  <Link href="/wealth" className="text-xs text-blue-600 hover:text-blue-700">{t('empty.addAssets')}</Link>
                </div>
              )}
            </div>

            {/* Goals Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">{t('section.goals')}</h3>
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
                  <p className="text-sm text-slate-400">{t('empty.noGoals')}</p>
                  <Link href="/goals" className="text-xs text-blue-600 hover:text-blue-700">{t('empty.setGoals')}</Link>
                </div>
              )}
            </div>

            {/* Monthly Expenses Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">{t('section.expenses')}</h3>
              {expenses.monthly.filter((e) => e.amount > 0).length > 0 ? (
                <div className="space-y-2">
                  {expenses.monthly.filter((e) => e.amount > 0).slice(0, 5).map((e, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-600">{e.labelZh}</span>
                      <span className="font-medium text-slate-800">{fmt(e.amount)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-sm">
                    <span className="text-slate-800">{t('section.monthlyTotal')}</span>
                    <span className="text-red-500">{fmt(monthlyExpenses)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-400">{t('empty.noExpenses')}</p>
                  <Link href="/expenses" className="text-xs text-blue-600 hover:text-blue-700">{t('empty.addExpenses')}</Link>
                </div>
              )}
            </div>
          </div>

          {/* Members Overview */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">{t('section.family')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                    {m.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : m.avatar}
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
