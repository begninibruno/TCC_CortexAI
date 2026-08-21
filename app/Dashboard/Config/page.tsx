'use client';

import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, Clock3, KeyRound, Loader2, LockKeyhole, MailCheck, Settings, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { changePassword, getCurrentUser, updateDisplayName } from '@/lib/authClient';
import TurnstileCaptcha from '@/components/TurnstileCaptcha';

const inputClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950';
const captchaConfigured = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

function SecurityItem({ title, description, complete = true }: { title: string; description: string; complete?: boolean }) {
  return <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950/60"><span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${complete ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'}`}><ShieldCheck className="h-4 w-4" /></span><div><p className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</p><p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p></div></div>;
}

export default function DashboardConfigPage() {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [recoverySending, setRecoverySending] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const firebaseUser = getCurrentUser();
  const lastAccess = firebaseUser?.metadata.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime).toLocaleString('pt-BR') : 'Sessão atual';

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
    } catch (error) { setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Não foi possível atualizar o nome.' }); }
    finally { setProfileSaving(false); }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault();
    if (newPassword.length < 8) return setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 8 caracteres.' });
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) return setMessage({ type: 'error', text: 'Use letras maiúsculas, minúsculas e pelo menos um símbolo.' });
    if (newPassword !== confirmation) return setMessage({ type: 'error', text: 'A confirmação da senha não coincide.' });
    setPasswordSaving(true); setMessage(null);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword(''); setNewPassword(''); setConfirmation('');
      setMessage({ type: 'success', text: 'Senha alterada com sucesso.' });
    } catch (error) { setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Não foi possível alterar a senha.' }); }
    finally { setPasswordSaving(false); }
  }

  async function sendRecoveryEmail() {
    if (!user?.email) return setMessage({ type: 'error', text: 'Sua conta não possui um e-mail válido.' });
    if (captchaConfigured && !captchaToken) return setMessage({ type: 'error', text: 'Confirme a verificação humana antes de continuar.' });
    setRecoverySending(true); setMessage(null);
    try {
      const response = await fetch('/api/recuperar-senha', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, captchaToken }) });
      const result = await response.json() as { erro?: string };
      if (!response.ok) throw new Error(result.erro || 'Não foi possível enviar o e-mail.');
      setMessage({ type: 'success', text: `Enviamos as instruções de recuperação para ${user.email}. Verifique também a caixa de spam.` });
    } catch (error) { setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Não foi possível enviar o e-mail.' }); }
    finally { setRecoverySending(false); setCaptchaToken(null); setCaptchaReset((current) => current + 1); }
  }

  return (
    <div className="dashboard-page space-y-5 text-slate-900 dark:text-white">
      <header className="flex items-center gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20"><Settings className="h-5 w-5" /></span><div><h1 className="text-2xl font-black tracking-tight md:text-3xl">Configurações da conta</h1><p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Perfil, senha, recuperação de acesso e proteção da conta.</p></div></header>

      {message && <div role="status" className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'}`}><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{message.text}</div>}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-3"><UserRound className="h-5 w-5 text-blue-600" /><div><p className="text-xs text-slate-500">Usuário conectado</p><p className="truncate font-black">{user?.nome || 'Usuário'}</p></div></div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-3"><MailCheck className="h-5 w-5 text-emerald-600" /><div className="min-w-0"><p className="text-xs text-slate-500">E-mail da conta</p><p className="truncate font-black">{user?.email || 'Não informado'}</p></div></div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-3"><Clock3 className="h-5 w-5 text-violet-600" /><div><p className="text-xs text-slate-500">Último acesso</p><p className="text-sm font-black">{lastAccess}</p></div></div></div>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <form onSubmit={saveProfile} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-3"><UserRound className="h-5 w-5 text-blue-600" /><div><h2 className="font-black">Dados pessoais</h2><p className="text-xs text-slate-500 dark:text-slate-400">Informações exibidas no sistema.</p></div></div><label className="mt-5 block text-sm font-medium">Nome completo<input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label><label className="mt-4 block text-sm font-medium text-slate-500 dark:text-slate-400">E-mail de acesso<input className={`${inputClass} cursor-not-allowed opacity-70`} value={user?.email ?? ''} disabled /></label><p className="mt-2 text-xs text-slate-500">O e-mail identifica sua empresa e não pode ser alterado nesta tela.</p><button disabled={profileSaving} className="mt-5 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">{profileSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{profileSaving ? 'Salvando...' : 'Salvar alterações'}</button></form>

        <form onSubmit={savePassword} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-3"><KeyRound className="h-5 w-5 text-blue-600" /><div><h2 className="font-black">Alterar senha</h2><p className="text-xs text-slate-500 dark:text-slate-400">Confirme a senha atual para proteger a conta.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="block text-sm font-medium sm:col-span-2">Senha atual<input className={inputClass} type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required /></label><label className="block text-sm font-medium">Nova senha<input className={inputClass} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength={8} required /></label><label className="block text-sm font-medium">Confirmar senha<input className={inputClass} type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" minLength={8} required /></label></div><p className="mt-3 text-xs text-slate-500">Use no mínimo 8 caracteres, com maiúscula, minúscula e símbolo.</p><button disabled={passwordSaving} className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">{passwordSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{passwordSaving ? 'Alterando...' : 'Alterar senha'}</button></form>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-3"><LockKeyhole className="h-5 w-5 text-blue-600" /><div><h2 className="font-black">Recuperar acesso por e-mail</h2><p className="text-xs text-slate-500 dark:text-slate-400">Receba um link seguro no e-mail cadastrado.</p></div></div><div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300"><p className="font-bold">Destino do e-mail</p><p className="mt-0.5 break-all text-xs">{user?.email}</p></div><div className="mt-4"><TurnstileCaptcha onVerify={setCaptchaToken} resetKey={captchaReset} /></div><button type="button" onClick={sendRecoveryEmail} disabled={recoverySending || (captchaConfigured && !captchaToken)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{recoverySending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}{recoverySending ? 'Enviando...' : 'Enviar e-mail de recuperação'}</button><p className="mt-3 text-xs leading-relaxed text-slate-500">Por segurança, o link expira e a verificação humana é validada no servidor antes do envio.</p></section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-emerald-600" /><div><h2 className="font-black">Proteção da conta</h2><p className="text-xs text-slate-500 dark:text-slate-400">Resumo dos controles de segurança ativos.</p></div></div><div className="mt-5 space-y-3"><SecurityItem title="Sessão autenticada" description="As páginas administrativas exigem uma conta válida do Firebase." /><SecurityItem title="Dados separados por empresa" description="As regras do banco permitem acesso somente aos dados do usuário conectado." /><SecurityItem title="Alteração protegida" description="A senha atual é solicitada novamente antes de definir uma nova." /><SecurityItem title="Verificação contra robôs" description={captchaConfigured ? 'O CAPTCHA está configurado e será validado no servidor.' : 'Adicione as chaves do Turnstile antes da publicação para ativar esta camada.'} complete={captchaConfigured} /></div></section>
      </div>
    </div>
  );
}
