'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { simpleHash, registerUser } from '@/lib/auth';
import { saveConfig, saveMembers } from '@/lib/storage';
import type { FamilyConfig, FamilyMember } from '@/lib/types';
import { DEFAULT_PERSONAL_EXPENSES } from '@/lib/types';

export default function SetupPage() {
  const router = useRouter();
  const { login, refreshSetup } = useAuth();
  const [step, setStep] = useState(1);

  // Step 1: Family name + admin credentials
  const [familyName, setFamilyName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [memberPassword, setMemberPassword] = useState('');

  // Step 2: First member (yourself)
  const [yourName, setYourName] = useState('');
  const [yourNameZh, setYourNameZh] = useState('');
  const [yourGender, setYourGender] = useState<'male' | 'female' | 'other'>('male');
  const [yourDob, setYourDob] = useState('');

  const [error, setError] = useState('');

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!familyName.trim()) {
      setError('请输入家庭名称');
      return;
    }
    if (!adminEmail.trim()) {
      setError('请输入管理员邮箱');
      return;
    }
    if (adminPassword.length < 4) {
      setError('密码至少4位');
      return;
    }
    if (adminPassword !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }
    setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!yourName.trim()) {
      setError('请输入您的姓名');
      return;
    }

    // Save config
    const config: FamilyConfig = {
      familyName: familyName.trim(),
      setupComplete: true,
      passwordHash: simpleHash(adminPassword),
      memberPasswordHash: memberPassword ? simpleHash(memberPassword) : undefined,
      createdAt: new Date().toISOString(),
    };
    saveConfig(config);

    // Register admin user
    registerUser(adminEmail.trim(), adminPassword, yourName.trim() || undefined);

    // Save first member
    const member: FamilyMember = {
      id: crypto.randomUUID(),
      name: yourName.trim(),
      nameZh: yourNameZh.trim(),
      gender: yourGender,
      dob: yourDob,
      relationship: 'self',
      jurisdiction: 'US',
      citizenship: '',
      taxResidency: '',
      occupation: '',
      employer: '',
      startDate: '',
      monthlySalary: 0,
      lifeStage: 'career',
      personalExpenses: DEFAULT_PERSONAL_EXPENSES.map((e) => ({ ...e })),
      avatar: yourName.trim().split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveMembers([member]);

    refreshSetup();
    login('admin', adminEmail.trim(), yourName.trim() || undefined);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white text-2xl font-bold mb-4">
            MFO
          </div>
          <h1 className="text-3xl font-bold text-white">初始设置</h1>
          <p className="text-blue-300 mt-2 text-sm">Initial Setup - Step {step} of 2</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {/* Progress */}
          <div className="flex gap-2 mb-6">
            <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-slate-200'}`} />
            <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-slate-200'}`} />
          </div>

          {step === 1 && (
            <form onSubmit={handleStep1}>
              <h2 className="text-lg font-semibold text-slate-800 mb-1">家庭信息</h2>
              <p className="text-sm text-slate-500 mb-6">Family Information</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    家庭名称 <span className="text-slate-400 font-normal">/ Family Name</span>
                  </label>
                  <input
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder="例：张家 / The Zhang Family"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    管理员邮箱 <span className="text-slate-400 font-normal">/ Admin Email</span>
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    管理员密码 <span className="text-slate-400 font-normal">/ Admin Password</span>
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="至少4位"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    确认密码 <span className="text-slate-400 font-normal">/ Confirm Password</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    成员密码 <span className="text-slate-400 font-normal">/ Member Password (optional)</span>
                  </label>
                  <input
                    type="password"
                    value={memberPassword}
                    onChange={(e) => setMemberPassword(e.target.value)}
                    placeholder="家庭成员登录用（可选）"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">不设置则成员使用管理员密码登录</p>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
              )}

              <button
                type="submit"
                className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                下一步 / Next
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2}>
              <h2 className="text-lg font-semibold text-slate-800 mb-1">添加自己</h2>
              <p className="text-sm text-slate-500 mb-6">Add Yourself as First Member</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    英文姓名 <span className="text-slate-400 font-normal">/ Name</span>
                  </label>
                  <input
                    type="text"
                    value={yourName}
                    onChange={(e) => setYourName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    中文姓名 <span className="text-slate-400 font-normal">/ Chinese Name (optional)</span>
                  </label>
                  <input
                    type="text"
                    value={yourNameZh}
                    onChange={(e) => setYourNameZh(e.target.value)}
                    placeholder="张三"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    性别 <span className="text-slate-400 font-normal">/ Gender</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['male', 'female', 'other'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setYourGender(g)}
                        className={`p-2 rounded-lg border text-sm transition-all ${
                          yourGender === g
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {g === 'male' ? '男 / Male' : g === 'female' ? '女 / Female' : '其他 / Other'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    出生日期 <span className="text-slate-400 font-normal">/ Date of Birth</span>
                  </label>
                  <input
                    type="date"
                    value={yourDob}
                    onChange={(e) => setYourDob(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  上一步 / Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  完成设置 / Complete
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
