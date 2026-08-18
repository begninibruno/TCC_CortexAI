'use client';

import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, KeyRound, Loader2, Settings, UserRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { changePassword, updateDisplayName } from '@/lib/authClient';

const inputClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950';

export default function DashboardConfigPage() {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => setName(user?.nome ?? ''), [user?.nome]);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName.length < 2) return setMessage({ type: 'error', text: 'Informe um nome com pelo menos 2 caracteres.' });
    setProfileSaving(true); setMessage(null);
    try {
      await updateDisplayName(trimmedName);
      updateUserProfile({ nome: trimmedName });
      setMessage({ type: 'success', text: 'Nome atualizado com sucesso.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Não foi possível atualizar o nome.' });
    } finally { setProfileSaving(false); }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault();
    if (newPassword.length < 8) return setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 8 caracteres.' });
    if (newPassword !== confirmation) return setMessage({ type: 'error', text: 'A confirmação da senha não coincide.' });
    setPasswordSaving(true); setMessage(null);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword(''); setNewPassword(''); setConfirmation('');
      setMessage({ type: 'success', text: 'Senha alterada com sucesso.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Não foi possível alterar a senha.' });
    } finally { setPasswordSaving(false); }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl pt-10 sm:pt-4">
        <div className="mb-8 flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20"><Settings className="h-6 w-6" /></span>
          <div><h1 className="text-3xl font-bold tracking-tight">Configurações da conta</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Gerencie seus dados e a segurança de acesso.</p></div>
        </div>

        {message && <div className={`mb-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'}`}><CheckCircle2 className="h-4 w-4 shrink-0" />{message.text}</div>}

        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={saveProfile} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3"><UserRound className="h-5 w-5 text-blue-600" /><div><h2 className="font-semibold">Dados pessoais</h2><p className="text-xs text-slate-500 dark:text-slate-400">Informações exibidas no sistema.</p></div></div>
            <label className="mt-6 block text-sm font-medium">Nome completo<input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label>
            <label className="mt-4 block text-sm font-medium text-slate-500 dark:text-slate-400">E-mail<input className={`${inputClass} cursor-not-allowed opacity-70`} value={user?.email ?? ''} disabled /></label>
            <button disabled={profileSaving} className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{profileSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{profileSaving ? 'Salvando...' : 'Salvar alterações'}</button>
          </form>

          <form onSubmit={savePassword} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3"><KeyRound className="h-5 w-5 text-blue-600" /><div><h2 className="font-semibold">Segurança</h2><p className="text-xs text-slate-500 dark:text-slate-400">Altere sua senha de acesso.</p></div></div>
            <label className="mt-6 block text-sm font-medium">Senha atual<input className={inputClass} type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required /></label>
            <label className="mt-4 block text-sm font-medium">Nova senha<input className={inputClass} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength={8} required /></label>
            <label className="mt-4 block text-sm font-medium">Confirmar nova senha<input className={inputClass} type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" minLength={8} required /></label>
            <button disabled={passwordSaving} className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">{passwordSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{passwordSaving ? 'Alterando...' : 'Alterar senha'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
