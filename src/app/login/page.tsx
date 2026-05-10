'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import {
  verifyEmailLogin,
  isSetupComplete,
  registerUser,
  getUserByEmail,
  getFamilyMemberByEmail,
  verifyMemberPassword,
  registerFamilyMember,
} from '@/lib/auth';
import { APP_VERSION } from '@/lib/version';
import Link from 'next/link';

type LoginStep = 'login' | 'register' | 'member_verify' | 'member_set_password';

export default function LoginPage() {
  const router = useRouter();
  const { login, setupDone } = useAuth();
  const [step, setStep] = useState<LoginStep>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [memberPassword, setMemberPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const resetForm = () => {
    setError('');
    setInfo('');
    setPassword('');
    setMemberPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!isSetupComplete()) {
      router.push('/setup');
      return;
    }

    const trimmedEmail = email.trim();

    // Check if user exists in registered users
    const existingUser = getUserByEmail(trimmedEmail);
    if (existingUser) {
      // Normal login flow
      const verified = verifyEmailLogin(trimmedEmail, password);
      if (verified) {
        login(verified.role, verified.email, verified.name);
        router.push('/');
      } else if (existingUser.status === 'pending') {
        setError('账户待管理员审批 / Account pending admin approval');
      } else {
        setError('密码错误 / Incorrect password');
      }
      return;
    }

    // Check if email belongs to a family member (not yet registered)
    const member = getFamilyMemberByEmail(trimmedEmail);
    if (member) {
      setMemberName(member.nameZh || member.name);
      setStep('member_verify');
      resetForm();
      return;
    }

    // Email not found anywhere
    setError('该邮箱未注册，请先注册 / Email not registered');
  };

  const handleMemberVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!verifyMemberPassword(memberPassword)) {
      setError('家庭成员密码错误 / Incorrect family member password');
      return;
    }

    // Member password verified, proceed to set personal password
    setStep('member_set_password');
    setMemberPassword('');
    setError('');
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 4) {
      setError('密码至少4位 / Password must be at least 4 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致 / Passwords do not match');
      return;
    }

    // Register the family member with their own password
    const user = registerFamilyMember(email.trim(), newPassword, memberName);
    login(user.role, user.email, user.name);
    router.push('/');
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
      setStep('login');
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
          {step === 'login' && (
            <>
              <h2 className="text-lg font-bold text-slate-800 mb-1">欢迎登录</h2>
              <p className="text-sm text-slate-500 mb-6">Sign in to your account</p>

              {info && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">{info}</div>
              )}

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
              </form>

              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => { setStep('register'); resetForm(); }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  新用户注册 / Register
                </button>
                {!setupDone && (
                  <Link href="/setup" className="text-slate-400 hover:text-slate-600">
                    首次设置 / Setup
                  </Link>
                )}
              </div>
            </>
          )}

          {step === 'member_verify' && (
            <>
              <h2 className="text-lg font-bold text-slate-800 mb-1">家庭成员验证</h2>
              <p className="text-sm text-slate-500 mb-2">Family Member Verification</p>
              <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">
                您好，<strong>{memberName}</strong>！您的邮箱已在家庭成员中登记。请输入家庭成员密码进行身份验证。
              </div>

              <form onSubmit={handleMemberVerify}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    家庭成员密码 / Family Password
                  </label>
                  <input
                    type="password"
                    value={memberPassword}
                    onChange={(e) => setMemberPassword(e.target.value)}
                    placeholder="输入家庭成员密码"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
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
                  验证 / Verify
                </button>
              </form>

              <button
                type="button"
                onClick={() => { setStep('login'); resetForm(); }}
                className="mt-4 text-sm text-slate-400 hover:text-slate-600"
              >
                返回登录 / Back to login
              </button>
            </>
          )}

          {step === 'member_set_password' && (
            <>
              <h2 className="text-lg font-bold text-slate-800 mb-1">设置个人密码</h2>
              <p className="text-sm text-slate-500 mb-2">Set Your Personal Password</p>
              <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">
                验证通过！<strong>{memberName}</strong>，请设置您的专属登录密码。以后登录只需邮箱+此密码。
              </div>

              <form onSubmit={handleSetPassword}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    新密码 / New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="至少4位"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    确认密码 / Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
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
                  设置密码并登录 / Set Password & Login
                </button>
              </form>
            </>
          )}

          {step === 'register' && (
            <>
              <h2 className="text-lg font-bold text-slate-800 mb-1">新用户注册</h2>
              <p className="text-sm text-slate-500 mb-6">Create a new account</p>

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

              <button
                type="button"
                onClick={() => { setStep('login'); resetForm(); }}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700"
              >
                已有账户？登录 / Already have an account? Login
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-blue-400/50 mt-4">v{APP_VERSION}</p>
      </div>
    </div>
  );
}
