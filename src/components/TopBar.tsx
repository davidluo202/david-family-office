'use client';

import { useAuth } from '@/lib/AuthContext';

export default function TopBar() {
  const { session } = useAuth();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <span className="text-sm text-slate-500">{dateStr}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
          {session?.role === 'admin' ? '管理员模式' : '成员模式'}
        </span>
        <span className="text-xs text-slate-400">Mini Family Office</span>
      </div>
    </header>
  );
}
