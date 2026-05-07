'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loadConfig, saveConfig, exportAllData, importAllData, resetAllData } from '@/lib/storage';
import { simpleHash, clearSession, loadUsers, approveUser, rejectUser } from '@/lib/auth';
import { useAuth } from '@/lib/AuthContext';
import type { FamilyConfig, FamilyData, AppUser } from '@/lib/types';

export default function SettingsPage() {
  const { session, logout } = useAuth();
  const router = useRouter();
  const isAdmin = session?.role === 'admin';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<FamilyConfig | null>(null);
  const [familyName, setFamilyName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [users, setUsers] = useState<AppUser[]>([]);
  const [rapidApiKey, setRapidApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    const c = loadConfig();
    setConfig(c);
    if (c) setFamilyName(c.familyName);
    setUsers(loadUsers());
    setRapidApiKey(localStorage.getItem('mfo_rapidapi_key') || '');
  }, []);

  const showMsg = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSaveName = () => {
    if (!config) return;
    const updated = { ...config, familyName: familyName.trim() };
    saveConfig(updated);
    setConfig(updated);
    showMsg('家庭名称已更新');
  };

  const handleChangePassword = () => {
    if (!config) return;
    if (newPassword.length < 4) {
      showMsg('密码至少4位', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showMsg('两次密码不一致', 'error');
      return;
    }
    const updated = { ...config, passwordHash: simpleHash(newPassword) };
    saveConfig(updated);
    setConfig(updated);
    setNewPassword('');
    setConfirmPassword('');
    showMsg('密码已更新');
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mfo-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMsg('数据已导出');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as FamilyData;
        if (!data.config) {
          showMsg('无效的备份文件', 'error');
          return;
        }
        importAllData(data);
        showMsg('数据已导入，页面即将刷新');
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        showMsg('文件解析失败', 'error');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApprove = (userId: string) => {
    approveUser(userId);
    setUsers(loadUsers());
    showMsg('用户已审批');
  };

  const handleReject = (userId: string) => {
    if (!confirm('确认拒绝并删除该用户？')) return;
    rejectUser(userId);
    setUsers(loadUsers());
    showMsg('用户已删除');
  };

  const handleReset = () => {
    if (!confirm('确认重置所有数据？此操作不可撤销！\nAre you sure? This cannot be undone!')) return;
    if (!confirm('再次确认：所有家庭数据将被永久删除！\nSecond confirmation: All data will be permanently deleted!')) return;
    resetAllData();
    clearSession();
    logout();
    router.push('/setup');
  };

  const handleSaveApiKey = () => {
    if (rapidApiKey.trim()) {
      localStorage.setItem('mfo_rapidapi_key', rapidApiKey.trim());
    } else {
      localStorage.removeItem('mfo_rapidapi_key');
    }
    showMsg('API Key 已保存');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">设置</h2>
        <p className="text-sm text-slate-500 mt-1">Settings - 系统设置和数据管理</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          messageType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>
          {message}
        </div>
      )}

      {/* Family Name */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">家庭名称 / Family Name</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!isAdmin}
          />
          {isAdmin && (
            <button onClick={handleSaveName}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              保存
            </button>
          )}
        </div>
      </div>

      {/* Password Change (Admin only) */}
      {isAdmin && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">修改密码 / Change Password</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">新密码 <span className="text-xs text-slate-400">New Password</span></label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="至少4位" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">确认密码 <span className="text-xs text-slate-400">Confirm</span></label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={handleChangePassword}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              更新密码
            </button>
          </div>
        </div>
      )}

      {/* User Management (Admin only) */}
      {isAdmin && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">用户管理 / User Management</h3>
          {users.length === 0 ? (
            <p className="text-sm text-slate-400">暂无注册用户</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{u.name || u.email}</p>
                    <p className="text-xs text-slate-400">{u.email} · {u.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {u.status === 'pending' ? (
                      <>
                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">待审批</span>
                        <button onClick={() => handleApprove(u.id)}
                          className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700">
                          批准
                        </button>
                        <button onClick={() => handleReject(u.id)}
                          className="px-3 py-1.5 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white">
                          拒绝
                        </button>
                      </>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">已激活</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* API Keys */}
      {isAdmin && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-1">API Keys</h3>
          <p className="text-xs text-slate-400 mb-4">用于 Zillow Zestimate 查询 · Used for Zillow property estimates</p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                RapidAPI Key <span className="text-xs text-slate-400">(zillow-com1.p.rapidapi.com)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={rapidApiKey}
                  onChange={(e) => setRapidApiKey(e.target.value)}
                  placeholder="Enter your RapidAPI key..."
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((v) => !v)}
                  className="px-3 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50"
                >
                  {showApiKey ? '隐藏' : '显示'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                获取免费Key: <a href="https://rapidapi.com/apimaker/api/zillow-com1" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">rapidapi.com → Zillow API</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Data Management */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">数据管理 / Data Management</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-700">导出数据 / Export Data</p>
              <p className="text-xs text-slate-400">下载所有家庭数据为 JSON 文件</p>
            </div>
            <button onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
              导出 JSON
            </button>
          </div>

          {isAdmin && (
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-700">导入数据 / Import Data</p>
                <p className="text-xs text-slate-400">从 JSON 备份文件恢复数据</p>
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  id="import-file"
                />
                <label htmlFor="import-file"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer inline-block">
                  选择文件
                </label>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
              <div>
                <p className="text-sm font-medium text-red-700">重置所有数据 / Reset All Data</p>
                <p className="text-xs text-red-400">永久删除所有家庭数据，不可恢复</p>
              </div>
              <button onClick={handleReset}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                重置
              </button>
            </div>
          )}
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">关于 / About</h3>
        <p className="text-sm text-slate-500">Mini Family Office v0.3.1</p>
        <p className="text-xs text-slate-400 mt-1">数据存储在浏览器本地 (localStorage)</p>
        <p className="text-xs text-slate-400">Data is stored locally in your browser</p>
      </div>
    </div>
  );
}
