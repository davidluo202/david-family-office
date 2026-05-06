'use client';

import { risks } from '@/data/mockData';

const levelStyles = {
  HIGH: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-500', text: 'text-red-700' },
  MEDIUM: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-500', text: 'text-yellow-700' },
  LOW: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-500', text: 'text-green-700' },
};

export default function RiskRadar() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Top 5 Risks</h3>
      <div className="space-y-3">
        {risks.map((risk, i) => {
          const styles = levelStyles[risk.level];
          return (
            <div key={i} className={`p-3 rounded-lg border ${styles.bg} ${styles.border}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] text-white px-1.5 py-0.5 rounded font-bold ${styles.badge}`}>
                  {risk.level}
                </span>
                <span className={`text-sm font-medium ${styles.text}`}>{risk.title}</span>
              </div>
              <p className="text-xs text-slate-500">{risk.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
