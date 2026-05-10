'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/i18n';
import { APP_VERSION } from '@/lib/version';
import { loadConfig } from '@/lib/storage';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/', tKey: 'nav.dashboard', label: 'Dashboard', labelZh: '仪表盘', icon: '\u{1F3E0}' },
  { href: '/family', tKey: 'nav.family', label: 'Family Members', labelZh: '家庭成员', icon: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}' },
  { href: '/wealth', tKey: 'nav.wealth', label: 'Assets & Liabilities', labelZh: '资产负债', icon: '\u{1F4B0}' },
  { href: '/portfolio', tKey: 'nav.portfolio', label: 'Portfolio', labelZh: '投资持仓', icon: '\u{1F4C8}' },
  { href: '/analytics', tKey: 'nav.analytics', label: 'Analytics', labelZh: '趋势分析', icon: '\u{1F4CA}' },
  { href: '/expenses', tKey: 'nav.expenses', label: 'Income & Expenses', labelZh: '收支管理', icon: '\u{1F4B3}' },
  { href: '/accounts', tKey: 'nav.accounts', label: 'Bank Accounts', labelZh: '银行账户', icon: '\u{1F3E6}' },
  { href: '/integrations', tKey: 'nav.integrations', label: 'Bank & Tax Data', labelZh: '银行/税表接口', icon: '\u{1F50C}' },
  { href: '/goals', tKey: 'nav.goals', label: 'Goals', labelZh: '目标', icon: '\u{1F3AF}' },
  { href: '/advisor', tKey: 'nav.advisor', label: 'AI Advisor', labelZh: 'AI 顾问', icon: '\u{1F916}' },
  { href: '/settings', tKey: 'nav.settings', label: 'Settings', labelZh: '设置', icon: '\u2699\uFE0F' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [familyName, setFamilyName] = useState('Mini Family Office');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const config = loadConfig();
    if (config?.familyName) {
      setFamilyName(config.familyName);
    }
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navContent = (
    <>
      <div className="px-6 py-6 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">MFO</h1>
          <p className="text-xs text-slate-400 mt-1">{familyName}</p>
        </div>
        {/* Close button on mobile */}
        <button
          className="md:hidden text-slate-400 hover:text-white text-xl"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          &#x2715;
        </button>
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
                <span className="font-medium block leading-tight">{lang === 'zh' ? item.labelZh : item.label}</span>
                <span className="text-[10px] text-slate-500 leading-tight">{lang === 'zh' ? item.label : item.labelZh}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-3 border-t border-slate-700 flex items-center justify-between">
        <button
          onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
          className="px-2.5 py-1 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Switch language"
        >
          {lang === 'zh' ? 'EN' : 'CN'}
        </button>
        <span className="text-[10px] text-slate-500">v{APP_VERSION}</span>
      </div>
      <div className="px-6 py-4 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
              {session?.role === 'admin' ? 'A' : 'M'}
            </div>
            <div>
              <p className="text-sm font-medium">
                {session?.memberName || (session?.role === 'admin' ? t('common.admin') : t('common.member'))}
              </p>
              <p className="text-xs text-slate-400 truncate max-w-[100px]">
                {session?.email || (session?.role === 'admin' ? 'Admin' : 'Member')}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-white transition-colors"
            title={t('common.logout')}
          >
            {t('common.logout')}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-[#0f172a] text-white rounded-lg flex items-center justify-center shadow-lg"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <span className="text-xl">&#x2630;</span>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile unless open */}
      <aside
        className={`fixed left-0 top-0 h-screen w-60 bg-[#0f172a] text-white flex flex-col z-50 transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {navContent}
      </aside>
    </>
  );
}
