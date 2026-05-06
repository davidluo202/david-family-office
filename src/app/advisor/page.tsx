'use client';

import { useState } from 'react';

export default function AdvisorPage() {
  const [question, setQuestion] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">AI 顾问</h2>
        <p className="text-sm text-slate-500 mt-1">AI Advisor - 个性化财务建议</p>
      </div>

      {/* Ask Question */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">提问 / Ask a Question</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="关于财务的问题，例如：应该增加529供款吗？"
            className="flex-1 px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            disabled
            className="px-6 py-3 bg-slate-300 text-white rounded-lg text-sm font-medium cursor-not-allowed"
          >
            Ask AI
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">AI 对话功能即将推出 / AI chat coming soon</p>
      </div>

      {/* Feature Placeholder */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100 text-center">
        <div className="text-5xl mb-4">&#x1F916;</div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">AI 财务顾问即将推出</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          基于您的家庭财务数据，AI将提供个性化的投资建议、税务优化方案和财务规划建议。
        </p>
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          <div className="p-4 bg-white rounded-lg">
            <span className="text-2xl">&#x1F4CA;</span>
            <p className="text-xs text-slate-600 mt-2">投资分析</p>
            <p className="text-[10px] text-slate-400">Portfolio Analysis</p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <span className="text-2xl">&#x1F4B0;</span>
            <p className="text-xs text-slate-600 mt-2">税务优化</p>
            <p className="text-[10px] text-slate-400">Tax Optimization</p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <span className="text-2xl">&#x1F3AF;</span>
            <p className="text-xs text-slate-600 mt-2">目标规划</p>
            <p className="text-[10px] text-slate-400">Goal Planning</p>
          </div>
        </div>
      </div>
    </div>
  );
}
