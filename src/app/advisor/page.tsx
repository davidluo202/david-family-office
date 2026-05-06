'use client';

import { useState } from 'react';
import { aiRecommendations, actionItems, risks } from '@/data/mockData';

const categoryIcons: Record<string, string> = {
  '保险优化': '🛡️',
  '税务规划': '📊',
  '教育基金': '🎓',
  '投资组合': '📈',
  '房产投资': '🏠',
};

export default function AdvisorPage() {
  const [question, setQuestion] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">AI Advisor</h2>
        <p className="text-sm text-slate-500 mt-1">Personalized financial recommendations and action plan</p>
      </div>

      {/* Ask Question (placeholder) */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Ask a Question</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about your finances, e.g., 'Should I increase 529 contributions?'"
            className="flex-1 px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Ask AI
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">AI chat coming in Phase 2. Below are pre-generated recommendations.</p>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">AI Recommendations</h3>
        <div className="space-y-4">
          {aiRecommendations.map((rec, i) => (
            <div key={i} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{categoryIcons[rec.category] || '💡'}</span>
                <h4 className="text-sm font-semibold text-blue-800">{rec.category}</h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{rec.message}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Action Items */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Action Items</h3>
          <div className="space-y-3">
            {actionItems.map((item, i) => {
              const dotColor = item.priority === 'critical' ? 'bg-red-500' : item.priority === 'warning' ? 'bg-yellow-500' : 'bg-green-500';
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${dotColor}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{item.action}</p>
                    <p className="text-xs text-slate-400">{item.deadline}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    item.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {item.status === 'in_progress' ? 'In Progress' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Risk Summary</h3>
          <div className="space-y-3">
            {risks.map((risk, i) => {
              const levelColor = risk.level === 'HIGH' ? 'bg-red-500' : risk.level === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500';
              return (
                <div key={i} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] text-white px-1.5 py-0.5 rounded font-bold ${levelColor}`}>
                      {risk.level}
                    </span>
                    <span className="text-sm font-medium text-slate-700">{risk.title}</span>
                  </div>
                  <p className="text-xs text-slate-500">{risk.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
