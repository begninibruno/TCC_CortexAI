'use client';

import Sidebar from '@/components/Sidebar';
import Toast from '@/components/Toast';
import { ToastProvider, ThemeProvider } from '@/lib/context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Sidebar />
        <main className="ml-[260px] min-h-screen bg-slate-50 dark:bg-slate-900
          text-slate-900 dark:text-slate-100 transition-colors duration-300">
          {children}
        </main>
        <Toast />
      </ToastProvider>
    </ThemeProvider>
  );
}
