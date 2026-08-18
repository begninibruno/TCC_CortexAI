'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Building2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { auth, db } from '@/src/firebase';
import { logout } from '@/lib/authClient';

const PLAN_LABELS = {
  cortexmini: 'CortexMini',
  cortex: 'Cortex',
  cortexpro: 'CortexPro',
} as const;

export default function ProfileMenu() {
  const { user } = useAuth();
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
    function closeOnOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  if (!user) return null;
  const initial = user.nome.trim().charAt(0).toUpperCase() || 'C';

  return (
    <div ref={menuRef} className="fixed right-4 top-4 z-30 sm:right-6 sm:top-5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-12 items-center gap-2 rounded-lg border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-left shadow-lg shadow-slate-900/10 transition hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900"
        aria-expanded={open}
        aria-label="Abrir menu de perfil"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{initial}</span>
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-36 truncate text-sm font-bold text-slate-900 dark:text-white">{user.nome}</span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">{PLAN_LABELS[plan]}</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-lg border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/15 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-100 px-3 py-3 dark:border-slate-800">
            <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{company}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Plano {PLAN_LABELS[plan]}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </button>
        </div>
      )}
    </div>
  );
}
