'use client';

export default function TopBar() {
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
          All Systems Normal
        </span>
        <span className="text-xs text-slate-400">Phase 1 MVP</span>
      </div>
    </header>
  );
}
