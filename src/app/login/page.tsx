'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { verifyEmailLogin, isSetupComplete, registerUser, getUserByEmail } from '@/lib/auth';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, setupDone } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!isSetupComplete()) {
      router.push('/setup');
      return;
    }

    const user = verifyEmailLogin(email.trim(), password);
    if (user) {
      login(user.role, user.email, user.name);
      router.push('/');
    } else {
      const found = getUserByEmail(email.trim());
      if (found && found.status === 'pending') {
        setError('账户待管理员审批 / Account pending admin approval');
      } else {
        setError('邮箱或密码错误 / Incorrect email or password');
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email.trim() || !password) {
      setError('请填写邮箱和密码');
      return;
    }
    if (password.length < 4) {
      setError('密码至少4位');
      return;
    }

    if (getUserByEmail(email.trim())) {
      setError('该邮箱已注册 / Email already registered');
      return;
    }

    const user = registerUser(email.trim(), password, name.trim() || undefined);
    if (user.status === 'active') {
      login(user.role, user.email, user.name);
      router.push('/');
    } else {
      setInfo('注册成功！等待管理员审批后即可登录。\nRegistered! Waiting for admin approval.');
      setMode('login');
      setPassword('');
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

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {/* Tab switch */}
          <div className="flex mb-6 border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setInfo(''); }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                mode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              登录 / Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); setInfo(''); }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                mode === 'register' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              注册 / Register
            </button>
          </div>

          {info && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">{info}</div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  邮箱 / Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                  required
                />
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
                  required
                />
              </div>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
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
          ) : (
            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  姓名 / Name <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  邮箱 / Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  密码 / Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少4位"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">首个注册账户自动成为管理员 / First registrant becomes admin</p>
              </div>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                注册 / Register
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
