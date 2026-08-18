'use client';

import { usePathname } from 'next/navigation';
import { Moon, Sun } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ProfileMenu from '@/components/ProfileMenu';
import { AuthProvider } from '@/context/AuthContext';
import { SidebarProvider, ThemeProvider, ToastProvider, useTheme } from '@/lib/context';

const HIDE_SIDEBAR_ROUTES = new Set(['/','/Inicial','/Login','/Cadastro']);

function AppShellContent({ children, hideSidebar }: { children: React.ReactNode; hideSidebar: boolean }) {
  const { dark, toggleTheme } = useTheme();

  return (
    <div className={hideSidebar ? 'min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100' : 'flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100'}>
      {hideSidebar && (
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Alternar modo"
          className="fixed top-4 right-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-3xl border border-slate-200 bg-white/90 text-slate-900 shadow-xl shadow-slate-900/10 backdrop-blur transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100"
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      )}

      {!hideSidebar && <Sidebar />}
      {!hideSidebar && <ProfileMenu />}
      <main className="flex-1 min-h-screen">{children}</main>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = HIDE_SIDEBAR_ROUTES.has(pathname);

  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <SidebarProvider>
            <AppShellContent hideSidebar={hideSidebar}>{children}</AppShellContent>
          </SidebarProvider>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
