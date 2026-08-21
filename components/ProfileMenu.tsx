'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Building2, Settings, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { auth, db } from '@/src/firebase';
import { logout } from '@/lib/authClient';

const PLAN_LABELS = {
  cortexmini: 'CortexMini',
  cortex: 'Cortex',
  cortexpro: 'CortexPro',
} as const;

export default function ProfileMenu({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<keyof typeof PLAN_LABELS>('cortex');
  const [company, setCompany] = useState('Minha empresa');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProfile() {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const snapshot = await getDoc(doc(db, 'empresas', currentUser.uid));
      const data = snapshot.data();
      if (typeof data?.empresa === 'string') setCompany(data.empresa);
      if (typeof data?.plano === 'string' && data.plano in PLAN_LABELS) {
        setPlan(data.plano as keyof typeof PLAN_LABELS);
      }
    }
    loadProfile().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  if (!user) return null;
  const initial = user.nome.trim().charAt(0).toUpperCase() || 'C';

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`group flex min-h-12 w-full items-center rounded-xl border border-transparent text-left transition-colors hover:border-slate-200 hover:bg-white dark:hover:border-slate-700 dark:hover:bg-slate-900 ${compact ? 'justify-center p-1' : 'gap-3 px-2 py-1.5'}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Abrir menu de perfil"
        title={compact ? `${user.nome} — ${PLAN_LABELS[plan]}` : undefined}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm shadow-blue-600/20">{initial}</span>
        {!compact && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">{user.nome}</span>
              <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">{PLAN_LABELS[plan]}</span>
            </span>
            <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {open && (
        <div role="menu" className={`absolute z-50 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/15 dark:border-slate-700 dark:bg-slate-900 ${compact ? 'bottom-0 left-[calc(100%+0.75rem)]' : 'bottom-[calc(100%+0.75rem)] left-0'}`}>
          <div className="flex items-center gap-3 border-b border-slate-100 px-3 py-3 dark:border-slate-800">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1f58f5] text-sm font-bold text-white">{initial}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{user.nome}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
          </div>
          <div className="border-b border-slate-100 px-3 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span className="flex items-center gap-2"><Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />{company}</span>
            <span className="mt-1.5 flex items-center gap-2"><Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />Plano {PLAN_LABELS[plan]}</span>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); router.push('/Dashboard/Config'); }}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Settings className="h-4 w-4" />
            Configurações da conta
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); void logout(); }}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </button>
        </div>
      )}
    </div>
  );
}
