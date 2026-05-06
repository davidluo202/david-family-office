'use client';

import { useEffect, useState } from 'react';
import { loadGoals, saveGoals } from '@/lib/storage';
import { useAuth } from '@/lib/AuthContext';
import type { Goal } from '@/lib/types';

function fmt(v: number) {
  return `$${v.toLocaleString()}`;
}

const priorityConfig = {
  high: { badge: 'bg-red-100 text-red-700 border-red-200', bar: 'bg-red-500' },
  medium: { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', bar: 'bg-yellow-500' },
  low: { badge: 'bg-green-100 text-green-700 border-green-200', bar: 'bg-green-500' },
};

export default function GoalsPage() {
  const { session } = useAuth();
  const isAdmin = session?.role === 'admin';
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  useEffect(() => {
    setGoals(loadGoals());
  }, []);

  const resetForm = () => {
    setName('');
    setTarget('');
    setCurrent('');
    setDeadline('');
    setPriority('medium');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (goal: Goal) => {
    setName(goal.name);
    setTarget(goal.target.toString());
    setCurrent(goal.current.toString());
    setDeadline(goal.deadline);
    setPriority(goal.priority);
    setEditingId(goal.id);
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const goal: Goal = {
      id: editingId || crypto.randomUUID(),
      name: name.trim(),
      target: parseFloat(target) || 0,
      current: parseFloat(current) || 0,
      deadline,
      priority,
    };

    let updated: Goal[];
    if (editingId) {
      updated = goals.map((g) => (g.id === editingId ? goal : g));
    } else {
      updated = [...goals, goal];
    }
    saveGoals(updated);
    setGoals(updated);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm('确认删除该目标？')) return;
    const updated = goals.filter((g) => g.id !== id);
    saveGoals(updated);
    setGoals(updated);
  };

  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalCurrent = goals.reduce((s, g) => s + g.current, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">目标追踪</h2>
          <p className="text-sm text-slate-500 mt-1">Goals - 财务目标进度</p>
        </div>
        {isAdmin && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            + 添加目标
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {editingId ? '编辑目标 / Edit Goal' : '添加目标 / Add Goal'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">目标名称 <span className="text-xs text-slate-400">Goal Name</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                placeholder="例：Emergency Fund" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">截止日期 <span className="text-xs text-slate-400">Deadline</span></label>
              <input type="text" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                placeholder="2030 或 Ongoing" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">目标金额 <span className="text-xs text-slate-400">Target ($)</span></label>
              <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} required min="0" step="1000"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">当前进度 <span className="text-xs text-slate-400">Current ($)</span></label>
              <input type="number" value={current} onChange={(e) => setCurrent(e.target.value)} min="0" step="1000"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">优先级 <span className="text-xs text-slate-400">Priority</span></label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Goal['priority'])}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="high">高 / High</option>
                <option value="medium">中 / Medium</option>
                <option value="low">低 / Low</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={resetForm}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">取消</button>
            <button type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              {editingId ? '保存' : '添加'}
            </button>
          </div>
        </form>
      )}

      {goals.length > 0 ? (
        <>
          {/* Overall Progress */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-800">整体进度 / Overall Progress</h3>
              <span className="text-2xl font-bold text-blue-600">{overallProgress}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full">
              <div className="h-3 bg-blue-500 rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-slate-400">当前: {fmt(totalCurrent)}</span>
              <span className="text-xs text-slate-400">目标: {fmt(totalTarget)}</span>
            </div>
          </div>

          {/* Goal Cards */}
          <div className="grid grid-cols-2 gap-6">
            {goals.map((goal) => {
              const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
              const config = priorityConfig[goal.priority];
              const gap = goal.target - goal.current;
              const isComplete = progress >= 100;

              return (
                <div key={goal.id} className={`bg-white rounded-xl p-6 shadow-sm border border-slate-100 ${isComplete ? 'ring-2 ring-green-200' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-800">{goal.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${config.badge}`}>
                        {goal.priority === 'high' ? '高' : goal.priority === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-slate-800">{progress}%</span>
                      {isAdmin && (
                        <div className="flex flex-col gap-1">
                          <button onClick={() => handleEdit(goal)}
                            className="text-xs text-blue-600 hover:text-blue-700">编辑</button>
                          <button onClick={() => handleDelete(goal.id)}
                            className="text-xs text-red-500 hover:text-red-600">删除</button>
                        </div>
                      )}
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
                      <p className="text-xs text-slate-400">当前</p>
                      <p className="text-sm font-bold text-slate-700">{fmt(goal.current)}</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-400">目标</p>
                      <p className="text-sm font-bold text-slate-700">{fmt(goal.target)}</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-400">缺口</p>
                      <p className={`text-sm font-bold ${gap > 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {gap > 0 ? fmt(gap) : '已完成'}
                      </p>
                    </div>
                  </div>
                  {goal.deadline && (
                    <p className="text-xs text-slate-400 mt-3 text-center">截止: {goal.deadline}</p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-100 text-center">
          <div className="text-5xl mb-4">&#x1F3AF;</div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">暂无目标</h3>
          <p className="text-sm text-slate-500">No goals yet. Set your first financial goal to track progress.</p>
        </div>
      )}
    </div>
  );
}
