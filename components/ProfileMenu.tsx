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

export default function ProfileMenu() {
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
        className="flex min-h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-left shadow-lg shadow-slate-900/10 transition hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
        aria-expanded={open}
        aria-label="Abrir menu de perfil"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1f58f5] text-sm font-bold text-white shadow-sm ring-2 ring-blue-100 dark:ring-blue-950">{initial}</span>
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-36 truncate text-sm font-bold text-slate-900 dark:text-white">{user.nome}</span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">{PLAN_LABELS[plan]}</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/15 dark:border-slate-700 dark:bg-slate-900">
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
            onClick={() => { setOpen(false); router.push('/Dashboard/Config'); }}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Settings className="h-4 w-4" />
            Configurações da conta
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); logout(); }}
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
