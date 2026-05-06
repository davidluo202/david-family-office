'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const PUBLIC_PATHS = ['/login', '/setup'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { session, setupDone, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (loading) return;

    if (!isPublicPage && !session) {
      if (!setupDone) {
        router.replace('/setup');
      } else {
        router.replace('/login');
      }
    }
  }, [loading, session, setupDone, isPublicPage, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white text-lg font-bold mb-3">
            MFO
          </div>
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Public pages render without sidebar
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Not logged in - show nothing while redirecting
  if (!session) {
    return null;
  }

  // Authenticated layout
  return (
    <>
      <Sidebar />
      <div className="ml-60">
        <TopBar />
        <main className="p-6">{children}</main>
      </div>
    </>
  );
}
