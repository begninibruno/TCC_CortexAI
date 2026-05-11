'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Home,
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  BarChart2,
  Cpu,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  Bell,
  Settings,
  Users,
  ArrowLeft,
  ArrowRight,
  Zap,
  Gift,
} from 'lucide-react';
import { useTheme, useSidebar } from '@/lib/context';
import { getEspStatus, marcarNaoLidasCount } from '@/lib/api';

const NAV_ITEMS = [
  { label: 'Produtos', href: '/Produtos', icon: Package },
  { label: 'Dashboard', href: '/Dashboard', icon: LayoutDashboard },
  { label: 'Categorias', href: '/Dashboard/Categorias', icon: Tag },
  { label: 'Clientes', href: '/Dashboard/Clientes', icon: Users },
  { label: 'Estoque', href: '/Dashboard/Estoque', icon: Package },
  { label: 'PDV', href: '/Dashboard/PDV', icon: Zap },
  { label: 'Vendas', href: '/Dashboard/Vendas', icon: ShoppingCart },
  { label: 'Cupons', href: '/Dashboard/Cupons', icon: Gift },
  { label: 'Relatórios', href: '/Dashboard/Relatorios', icon: BarChart2 },
  { label: 'Notificações', href: '/Dashboard/Notificacoes', icon: Bell },
  { label: 'Configurações', href: '/Dashboard/Config', icon: Settings },
];

function SidebarContent({ pathname, collapsed, setSidebarOpen, notifsCount }: {
  pathname: string;
  collapsed: boolean;
  setSidebarOpen?: (v: boolean) => void;
  notifsCount: number;
}) {
  const { dark, toggleTheme } = useTheme();
  const [espOnline, setEspOnline] = useState(false);

  useEffect(() => {
    async function checkEsp() {
      try {
        const s = await getEspStatus();
        setEspOnline(s.online);
      } catch {
        setEspOnline(false);
      }
    }
    checkEsp();
    const id = setInterval(checkEsp, 30000);
    return () => clearInterval(id);
  }, []);

  const activeNavItem = NAV_ITEMS.reduce((best, item) => {
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      return !best || item.href.length > best.href.length ? item : best;
    }
    return best;
  }, null as (typeof NAV_ITEMS)[number] | null);

  const isNavItemActive = (href: string) => activeNavItem?.href === href;

  return (
    <>
      <div className={`flex items-center border-b border-blue-900 ${collapsed ? 'justify-center px-3 py-4' : 'gap-3 px-5 py-5'}`}>
        <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-cyan-500/20">
          <Cpu className="text-white" size={22} />
        </div>
        {!collapsed && (
          <div>
            <span className="block text-slate-900 dark:text-white text-xl font-black tracking-tight">CortexAI</span>
            <span className="text-slate-500 dark:text-slate-300 text-xs uppercase tracking-[0.3em]">Painel</span>
          </div>
        )}
      </div>

      <nav className={`flex-1 overflow-y-auto ${collapsed ? 'px-2 py-2' : 'px-3 py-4 space-y-2'}`}>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = isNavItemActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen?.(false)}
              className={`group flex items-center gap-3 rounded-3xl text-sm font-semibold transition-all duration-200 ease-out ${collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'} ${isActive ? 'bg-blue-500 text-white shadow-[0_20px_50px_rgba(15,23,42,0.35)]' : 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-slate-200 hover:bg-blue-500/20 hover:text-white'} transform ${isActive ? '' : 'hover:-translate-x-0.5'}`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-3xl ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-slate-200'} transition-all duration-200 group-hover:bg-blue-500/25`}>
                <Icon className="w-5 h-5" />
              </div>
              {!collapsed && (
                <>
                  <span className="whitespace-nowrap">{label}</span>
                  {isActive && <span className="ml-auto h-2 w-2 rounded-full bg-white/80" />}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={`border-t border-blue-900 dark:border-slate-700 ${collapsed ? 'pb-3 pt-2 space-y-2' : 'px-3 pb-4 pt-3 space-y-3'}`}>
        <div className={`${collapsed ? 'flex justify-center p-3' : 'flex items-center gap-3 px-4 py-3'} rounded-3xl ${espOnline ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200' : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300'} transition-colors duration-200`}>
          {espOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {!collapsed && <span className="text-xs font-black uppercase tracking-[0.28em]">{espOnline ? 'ESP online' : 'ESP offline'}</span>}
        </div>

        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 rounded-3xl ${collapsed ? 'justify-center p-3' : 'px-4 py-3'} bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-slate-200 transition duration-200 hover:bg-blue-500/10 dark:hover:bg-blue-500/20`}
        >
          <Moon className="w-5 h-5 dark:hidden" />
          <Sun className="w-5 h-5 hidden dark:flex text-amber-300" />
          {!collapsed && <span>{dark ? 'Modo Claro' : 'Modo Escuro'}</span>}
        </button>
      </div>
    </>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [notifsCount, setNotifsCount] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    async function count() {
      try {
        const c = await marcarNaoLidasCount();
        setNotifsCount(c);
      } catch {
        setNotifsCount(0);
      }
    }
    count();
  }, []);

  return (
    <>
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-700 text-white shadow-xl shadow-blue-950/40 md:hidden transition-transform duration-200 hover:-translate-y-0.5"
          aria-label="Abrir menu"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      )}

      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-950/80 md:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed top-0 left-0 z-50 flex h-screen w-[280px] flex-col bg-slate-100 dark:bg-[#071431] border-r border-slate-200 dark:border-blue-900/60 shadow-2xl md:hidden">
            <div className="flex items-center justify-between px-4 py-4 border-b border-blue-900/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-cyan-500/20">
                  <Cpu className="text-white" size={20} />
                </div>
                <span className="text-white font-black">CortexAI</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-200 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent pathname={pathname} collapsed={false} setSidebarOpen={setSidebarOpen} notifsCount={notifsCount} />
          </aside>
        </>
      )}

      <aside className={`hidden md:flex md:w-[280px] md:flex-col md:bg-slate-100 dark:md:bg-[#071431] md:border-r md:border-slate-200 dark:md:border-blue-900/60 md:shadow-2xl md:transition-all md:duration-300 ${collapsed ? 'md:w-[88px]' : ''}`}>
        <SidebarContent pathname={pathname} collapsed={collapsed} notifsCount={notifsCount} />
        <div className="px-3 pb-4 hidden md:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full rounded-3xl bg-white/5 px-4 py-3 text-sm font-bold text-slate-200 transition duration-200 hover:bg-white/10"
          >
            {collapsed ? 'Abrir' : 'Recolher'}
          </button>
        </div>
      </aside>
    </>
  );
}
