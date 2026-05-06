'use client';

import { goals } from '@/data/mockData';

const priorityConfig = {
  high: { badge: 'bg-red-100 text-red-700 border-red-200', bar: 'bg-red-500', ring: 'ring-red-100' },
  medium: { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', bar: 'bg-yellow-500', ring: 'ring-yellow-100' },
  low: { badge: 'bg-green-100 text-green-700 border-green-200', bar: 'bg-green-500', ring: 'ring-green-100' },
};

function getDeadlineInfo(deadline: string): { text: string; urgent: boolean } {
  if (deadline === 'Ongoing') return { text: 'Ongoing', urgent: false };
  const year = parseInt(deadline);
  const now = new Date().getFullYear();
  const yearsLeft = year - now;
  if (yearsLeft <= 1) return { text: `${deadline} (< 1 year)`, urgent: true };
  return { text: `${deadline} (${yearsLeft} years)`, urgent: false };
}

export default function GoalsPage() {
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalCurrent = goals.reduce((s, g) => s + g.current, 0);
  const overallProgress = Math.round((totalCurrent / totalTarget) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Goals & Tracking</h2>
        <p className="text-sm text-slate-500 mt-1">Financial goals progress and deadlines</p>
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-800">Overall Progress</h3>
          <span className="text-2xl font-bold text-blue-600">{overallProgress}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full">
          <div className="h-3 bg-blue-500 rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-slate-400">Current: ${totalCurrent.toLocaleString()}</span>
          <span className="text-xs text-slate-400">Target: ${totalTarget.toLocaleString()}</span>
        </div>
      </div>

      {/* Goal Cards */}
      <div className="grid grid-cols-2 gap-6">
        {goals.map((goal) => {
          const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
          const config = priorityConfig[goal.priority];
          const deadline = getDeadlineInfo(goal.deadline);
          const gap = goal.target - goal.current;
          const isComplete = progress >= 100;

          return (
            <div key={goal.id} className={`bg-white rounded-xl p-6 shadow-sm border border-slate-100 ${isComplete ? 'ring-2 ring-green-200' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-slate-800">{goal.name}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${config.badge}`}>
                    {goal.priority} priority
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-800">{progress}%</p>
                  <p className={`text-xs ${deadline.urgent ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                    {deadline.text}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="h-3 bg-slate-100 rounded-full">
                  <div
                    className={`h-3 rounded-full transition-all ${isComplete ? 'bg-green-500' : config.bar}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400">Current</p>
                  <p className="text-sm font-bold text-slate-700">${goal.current.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400">Target</p>
                  <p className="text-sm font-bold text-slate-700">${goal.target.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400">Gap</p>
                  <p className={`text-sm font-bold ${gap > 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {gap > 0 ? `$${gap.toLocaleString()}` : 'Complete'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
