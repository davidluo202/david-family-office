'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { loadConfig } from '@/lib/storage';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', labelZh: '仪表盘', icon: '\u{1F3E0}' },
  { href: '/family', label: 'Family Members', labelZh: '家庭成员', icon: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}' },
  { href: '/wealth', label: 'Assets & Liabilities', labelZh: '资产负债', icon: '\u{1F4B0}' },
  { href: '/expenses', label: 'Income & Expenses', labelZh: '收支管理', icon: '\u{1F4B3}' },
  { href: '/accounts', label: 'Bank Accounts', labelZh: '银行账户', icon: '\u{1F3E6}' },
  { href: '/goals', label: 'Goals', labelZh: '目标', icon: '\u{1F3AF}' },
  { href: '/advisor', label: 'AI Advisor', labelZh: 'AI 顾问', icon: '\u{1F916}' },
  { href: '/settings', label: 'Settings', labelZh: '设置', icon: '\u2699\uFE0F' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useAuth();
  const [familyName, setFamilyName] = useState('Mini Family Office');

  useEffect(() => {
    const config = loadConfig();
    if (config?.familyName) {
      setFamilyName(config.familyName);
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0f172a] text-white flex flex-col z-50">
      <div className="px-6 py-6 border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-tight">MFO</h1>
        <p className="text-xs text-slate-400 mt-1">{familyName}</p>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <div>
                <span className="font-medium block leading-tight">{item.labelZh}</span>
                <span className="text-[10px] text-slate-500 leading-tight">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
              {session?.role === 'admin' ? 'A' : 'M'}
            </div>
            <div>
              <p className="text-sm font-medium">
                {session?.role === 'admin' ? '管理员' : '成员'}
              </p>
              <p className="text-xs text-slate-400">
                {session?.role === 'admin' ? 'Admin' : 'Member'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-white transition-colors"
            title="退出 / Logout"
          >
            退出
          </button>
        </div>
      </div>
    </aside>
  );
}
