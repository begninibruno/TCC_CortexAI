'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarChart3, Boxes, ChevronLeft, ChevronRight, Menu, Package, Settings, ShoppingCart, Tags, Users, X } from 'lucide-react';
import { useSidebar } from '@/lib/context';
import ProfileMenu from '@/components/ProfileMenu';
import ThemeToggle from '@/components/ThemeToggle';

const NAV_ITEMS = [
  { label: 'Produtos', href: '/Dashboard/Produtos', icon: Package },
  { label: 'Categorias', href: '/Dashboard/Categorias', icon: Tags },
  { label: 'Clientes', href: '/Dashboard/Clientes', icon: Users },
  { label: 'Estoque', href: '/Dashboard/Estoque', icon: Boxes },
  { label: 'Vendas', href: '/Dashboard/Vendas', icon: ShoppingCart },
  { label: 'Relatórios', href: '/Dashboard/Relatorios', icon: BarChart3 },
  { label: 'Configurações', href: '/Dashboard/Config', icon: Settings },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/Dashboard/Produtos" className={`flex items-center ${compact ? 'justify-center' : 'gap-3'}`} aria-label="Ir para o início do painel">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-900 dark:bg-slate-900">
        <Image src="/logo.png" alt="" width={28} height={28} priority />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block text-base font-extrabold tracking-tight text-slate-950 dark:text-white">CortexAI</span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Gestão inteligente</span>
        </span>
      )}
    </Link>
  );
}

function Navigation({ pathname, compact = false, onNavigate }: { pathname: string; compact?: boolean; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navegação principal">
      {!compact && <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Operação</p>}
      <div className="space-y-1.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }, index) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const startsSettings = index === NAV_ITEMS.length - 1;
          return (
            <div key={href} className={startsSettings ? 'pt-3' : undefined}>
              {startsSettings && <div className="mb-3 border-t border-slate-200 dark:border-slate-800" />}
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                title={compact ? label : undefined}
                className={`group flex min-h-11 items-center rounded-xl text-sm font-semibold ${compact ? 'justify-center px-2' : 'gap-3 px-3'} ${active ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'}`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} aria-hidden="true" />
                {!compact && <span className="truncate">{label}</span>}
              </Link>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

function SidebarFooter({ compact, onToggleCompact }: { compact: boolean; onToggleCompact?: () => void }) {
  return (
    <div className="border-t border-slate-200 p-3 dark:border-slate-800">
      <ProfileMenu compact={compact} />
      <div className="my-3 border-t border-slate-200 dark:border-slate-800" />
      <div className={`flex items-center ${compact ? 'flex-col gap-2' : 'gap-2'}`}>
        <ThemeToggle />
        {!compact && <span className="min-w-0 flex-1 text-xs font-medium text-slate-500 dark:text-slate-400">Aparência do painel</span>}
        {onToggleCompact && (
          <button
            type="button"
            onClick={onToggleCompact}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            aria-label={compact ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            title={compact ? 'Expandir menu' : 'Recolher menu'}
          >
            {compact ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCollapsed(localStorage.getItem('cortex-sidebar-collapsed') === 'true');
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [setSidebarOpen, sidebarOpen]);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem('cortex-sidebar-collapsed', String(next));
      return next;
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-30 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 md:hidden"
        aria-label="Abrir menu principal"
        aria-expanded={sidebarOpen}
      >
        <Menu className="h-5 w-5" />
      </button>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button type="button" aria-label="Fechar menu" className="absolute inset-0 h-full w-full bg-slate-950/55 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 flex h-dvh w-[min(19rem,86vw)] flex-col border-r border-slate-200 bg-slate-50 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800">
              <Brand />
              <button type="button" onClick={() => setSidebarOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Fechar menu principal">
                <X className="h-5 w-5" />
              </button>
            </div>
            <Navigation pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
            <SidebarFooter compact={false} />
          </aside>
        </div>
      )}

      <aside className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-slate-200 bg-slate-50 shadow-sm transition-[width] duration-300 dark:border-slate-800 dark:bg-slate-950 md:flex ${collapsed ? 'w-[5.25rem]' : 'w-64'}`}>
        <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
          <Brand compact={collapsed} />
        </div>
        <Navigation pathname={pathname} compact={collapsed} />
        <SidebarFooter compact={collapsed} onToggleCompact={toggleCollapsed} />
      </aside>
    </>
  );
}
