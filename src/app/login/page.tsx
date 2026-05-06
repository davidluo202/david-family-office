'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { verifyPassword, isSetupComplete } from '@/lib/auth';
import type { UserRole } from '@/lib/types';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, setupDone } = useAuth();
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isSetupComplete()) {
      router.push('/setup');
      return;
    }

    if (verifyPassword(password, role)) {
      login(role);
      router.push('/');
    } else {
      setError('密码错误 / Incorrect password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white text-2xl font-bold mb-4">
            MFO
          </div>
          <h1 className="text-3xl font-bold text-white">Mini Family Office</h1>
          <p className="text-blue-300 mt-2 text-sm">家庭财务管理中心</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              身份 / Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  role === 'admin'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <span className="block text-lg mb-1">&#x1f511;</span>
                <span className="text-sm font-medium">管理员</span>
                <span className="block text-xs text-slate-400">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('member')}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  role === 'member'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <span className="block text-lg mb-1">&#x1f464;</span>
                <span className="text-sm font-medium">家庭成员</span>
                <span className="block text-xs text-slate-400">Member</span>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              密码 / Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            登录 / Login
          </button>

          {!setupDone && (
            <Link
              href="/setup"
              className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-700"
            >
              首次使用？设置家庭 / First time? Set up your family
            </Link>
          )}
        </form>
      </div>
    </div>
  );
}
