'use client';

import { calculateHealthScore } from '@/lib/healthScore';

export default function HealthScore() {
  const { total, dimensions } = calculateHealthScore();

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (total / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#eab308';
    return '#ef4444';
  };

  const getLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const color = getColor(total);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Health Score</h3>
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color }}>{total}</span>
            <span className="text-xs text-slate-400">{getLabel(total)}</span>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          {dimensions.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="text-xs text-slate-500 w-24 truncate" title={d.nameZh}>
                {d.name}
              </span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${(d.score / d.maxPoints) * 100}%`,
                    backgroundColor:
                      d.status === 'excellent' ? '#22c55e' :
                      d.status === 'good' ? '#3b82f6' :
                      d.status === 'fair' ? '#eab308' : '#ef4444',
                  }}
                />
              </div>
              <span className="text-xs text-slate-400 w-8 text-right">{d.score}/{d.maxPoints}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
