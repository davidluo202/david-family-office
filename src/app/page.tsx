'use client';

import HealthScore from '@/components/HealthScore';
import NetWorthChart from '@/components/NetWorthChart';
import AssetPieChart from '@/components/AssetPieChart';
import GoalProgress from '@/components/GoalProgress';
import RiskRadar from '@/components/RiskRadar';
import ActionItems from '@/components/ActionItems';
import { getNetWorth, getMonthlySavings, getEmergencyMonths, getSavingsRate } from '@/lib/healthScore';
import { upcomingEvents } from '@/data/mockData';

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
  const netWorth = getNetWorth();
  const monthlySavings = getMonthlySavings();
  const emergencyMonths = getEmergencyMonths();
  const savingsRate = getSavingsRate();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Command Center</h2>
        <p className="text-sm text-slate-500 mt-1">Family financial overview at a glance</p>
      </div>

      {/* Row 1: Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Net Worth" value={`$${netWorth.toLocaleString()}`} sub="+3.2% YoY" color="text-blue-600" />
        <StatCard label="Monthly Cash Flow" value={`+$${monthlySavings.toLocaleString()}`} sub={`${savingsRate}% savings rate`} color="text-green-600" />
        <StatCard label="Emergency Reserve" value={`${emergencyMonths} months`} sub="Target: 6 months" color="text-emerald-600" />
        <StatCard label="Family Members" value="4" sub="2 adults, 2 children" />
      </div>

      {/* Row 2: Health Score */}
      <HealthScore />

      {/* Row 3: Charts */}
      <div className="grid grid-cols-3 gap-6">
        <AssetPieChart />
        <NetWorthChart />
        <GoalProgress />
      </div>

      {/* Row 4: Risks, Actions, Events */}
      <div className="grid grid-cols-3 gap-6">
        <RiskRadar />
        <ActionItems />
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {upcomingEvents.map((event, i) => {
              const date = new Date(event.date);
              const month = date.toLocaleDateString('en-US', { month: 'short' });
              const day = date.getDate();
              const typeColors: Record<string, string> = {
                insurance: 'bg-red-100 text-red-700',
                investment: 'bg-blue-100 text-blue-700',
                tax: 'bg-purple-100 text-purple-700',
                education: 'bg-yellow-100 text-yellow-700',
                review: 'bg-green-100 text-green-700',
              };
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="text-center w-12 flex-shrink-0">
                    <p className="text-xs text-slate-400">{month}</p>
                    <p className="text-lg font-bold text-slate-700">{day}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">{event.title}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${typeColors[event.type] || 'bg-slate-100 text-slate-500'}`}>
                      {event.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
