'use client';

import { actionItems } from '@/data/mockData';

const priorityStyles = {
  critical: { dot: 'bg-red-500', bg: 'bg-red-50' },
  warning: { dot: 'bg-yellow-500', bg: 'bg-yellow-50' },
  info: { dot: 'bg-green-500', bg: 'bg-green-50' },
};

export default function ActionItems() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">AI Action Plan</h3>
      <div className="space-y-2">
        {actionItems.map((item, i) => {
          const styles = priorityStyles[item.priority];
          return (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${styles.bg}`}>
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${styles.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700">{item.action}</p>
                <p className="text-xs text-slate-400">{item.deadline}</p>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  item.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {item.status === 'in_progress' ? 'In Progress' : 'Pending'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
