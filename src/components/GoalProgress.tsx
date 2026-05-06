'use client';

import { goals } from '@/data/mockData';

const priorityColors = {
  high: { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-500' },
  low: { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' },
};

export default function GoalProgress() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Goal Progress</h3>
      <div className="space-y-4">
        {goals.map((goal) => {
          const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
          const colors = priorityColors[goal.priority];
          return (
            <div key={goal.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">{goal.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${colors.bg} ${colors.text}`}>
                    {goal.priority}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{goal.deadline}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-100 rounded-full">
                  <div
                    className={`h-2 rounded-full transition-all ${colors.bar}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500 w-10 text-right">{progress}%</span>
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[10px] text-slate-400">${goal.current.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400">${goal.target.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
