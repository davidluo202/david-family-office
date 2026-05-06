'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '🏠' },
  { href: '/family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { href: '/wealth', label: 'Wealth', icon: '💰' },
  { href: '/cashflow', label: 'Cash Flow', icon: '💳' },
  { href: '/goals', label: 'Goals', icon: '🎯' },
  { href: '/advisor', label: 'AI Advisor', icon: '🤖' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0f172a] text-white flex flex-col z-50">
      <div className="px-6 py-6 border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-tight">DFO</h1>
        <p className="text-xs text-slate-400 mt-1">David Family Office</p>
      </div>
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
            DL
          </div>
          <div>
            <p className="text-sm font-medium">David Luo</p>
            <p className="text-xs text-slate-400">罗新涛</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
