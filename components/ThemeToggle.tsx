'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/context';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Alternar entre tema claro e escuro"
      title="Alternar tema"
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-700 shadow-sm backdrop-blur hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-blue-700 ${className}`}
    >
      <Moon className="h-4.5 w-4.5 dark:hidden" aria-hidden="true" />
      <Sun className="hidden h-4.5 w-4.5 dark:block" aria-hidden="true" />
    </button>
  );
}
