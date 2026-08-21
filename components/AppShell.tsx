'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, ThemeProvider, ToastProvider } from '@/lib/context';

const HIDE_SIDEBAR_ROUTES = new Set(['/','/Inicial','/Login','/Cadastro']);

function AppShellContent({ children, hideSidebar }: { children: React.ReactNode; hideSidebar: boolean }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const showFloatingTheme = pathname === '/Login' || pathname === '/Cadastro';
  const showDashboardChrome = !hideSidebar && !isLoading && isAuthenticated;

  return (
    <div className={hideSidebar ? 'min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100' : 'flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100'}>
      {showFloatingTheme && <ThemeToggle className="fixed right-4 top-4 z-50 h-11 w-11 rounded-2xl shadow-lg sm:right-6 sm:top-5" />}

      {showDashboardChrome && <Sidebar />}
      <main className="min-h-screen min-w-0 flex-1">{children}</main>
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
