'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { SidebarProvider, ThemeProvider, ToastProvider } from '@/lib/context';

const HIDE_SIDEBAR_ROUTES = new Set(['/','/Inicial','/Login','/Cadastro']);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = HIDE_SIDEBAR_ROUTES.has(pathname);

  return (
    <ThemeProvider>
      <ToastProvider>
        <SidebarProvider>
          <div className={hideSidebar ? 'min-h-screen bg-[#071431]' : 'flex min-h-screen bg-[#071431]'}>
            {!hideSidebar && <Sidebar />}
            <main className={`flex-1 min-h-screen ${hideSidebar ? '' : ''}`}>
              {children}
            </main>
          </div>
        </SidebarProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
