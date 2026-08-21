'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Download, X, Mail, Phone } from 'lucide-react';
import { getClientes, createCliente, updateCliente, deleteCliente } from '@/lib/api';
import { useToast } from '@/lib/context';
import type { Cliente } from '@/lib/types';
import Modal from '@/components/Modal';
import LoadingSpinner from '@/components/LoadingSpinner';

const EMPTY = { nome: '', cpf: '', email: '', telefone: '', endereco: '', obs: '', ativo: true };
const inp = `w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400`;

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) { return <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>{children}</div>; }

export default function ClientesPage() {
  const { addToast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editOne, setEditOne] = useState<Cliente | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [delTarget, setDelTarget] = useState<Cliente | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => { try { setClientes(await getClientes()); } catch { addToast('error', 'Erro ao carregar'); } finally { setLoading(false); } }, [addToast]);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => clientes.filter(c => { const q = search.toLowerCase(); return !q || c.nome.toLowerCase().includes(q) || (c.cpf || '').includes(q) || (c.email || '').toLowerCase().includes(q); }), [clientes, search]);

  function openAdd() { setEditOne(null); setForm(EMPTY); setShowModal(true); }
  function openEdit(c: Cliente) { setEditOne(c); setForm({ nome: c.nome, cpf: c.cpf || '', email: c.email || '', telefone: c.telefone || '', endereco: c.endereco || '', obs: c.obs || '', ativo: c.ativo }); setShowModal(true); }

  async function handleSave() { if (!form.nome.trim()) { addToast('error', 'Nome obrigatório'); return; } setSaving(true); try { if (editOne) await updateCliente(editOne.id, form); else await createCliente(form); setShowModal(false); addToast('success', editOne ? 'Atualizado!' : 'Criado!'); load(); } catch (e: unknown) { addToast('error', e instanceof Error ? e.message : 'Erro'); } finally { setSaving(false); } }
  async function handleDel() { if (!delTarget) return; setDeleting(true); try { await deleteCliente(delTarget.id); addToast('success', 'Cliente excluído.'); setDelTarget(null); await load(); } catch { addToast('error', 'Não foi possível excluir o cliente.'); } finally { setDeleting(false); } }
  function exportCSV() {
    const cell = (value: unknown) => {
      const raw = String(value ?? '');
      const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const rows = [
      ['Nome', 'CPF', 'E-mail', 'Telefone'].map(cell).join(';'),
      ...filtered.map((cliente) => [cliente.nome, cliente.cpf, cliente.email, cliente.telefone].map(cell).join(';')),
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${rows}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'clientes.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="dashboard-page max-w-7xl space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-3xl">Clientes</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{clientes.length} cliente{clientes.length === 1 ? '' : 's'} cadastrado{clientes.length === 1 ? '' : 's'}</p></div>
        <div className="flex w-full gap-2 md:w-auto"><button onClick={exportCSV} disabled={!filtered.length} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 md:flex-none"><Download className="h-4 w-4" />Exportar</button><button onClick={openAdd} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 md:flex-none"><Plus className="h-4 w-4" />Novo cliente</button></div>
      </div>
      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-sm max-w-md"><Search className="w-4 h-4 text-slate-400 flex-shrink-0" /><input type="text" placeholder="Buscar por nome, CPF ou email..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 text-sm bg-transparent focus:outline-none" />{search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-slate-400" /></button>}</div>
      {loading ? <div className="flex justify-center h-40 items-center"><LoadingSpinner size="lg" /></div> : filtered.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 text-center dark:border-slate-700"><p className="font-semibold text-slate-700 dark:text-slate-200">{search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</p><p className="mt-1 text-sm text-slate-500">{search ? 'Tente buscar por outro nome, documento ou e-mail.' : 'Cadastre o primeiro cliente para vinculá-lo às vendas.'}</p>{!search && <button onClick={openAdd} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Cadastrar cliente</button>}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md flex flex-col gap-3">
              <div className="flex items-start justify-between"><div className="min-w-0 flex-1"><p className="font-bold truncate">{c.nome}</p>{c.cpf && <p className="text-xs text-slate-400">CPF: {c.cpf}</p>}</div><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.ativo ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>{c.ativo ? 'Ativo' : 'Inativo'}</span></div>
              <div className="space-y-1 text-xs text-slate-500">{c.email && <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /><span className="truncate">{c.email}</span></div>}{c.telefone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /><span className="truncate">{c.telefone}</span></div>}</div>
              <div className="flex gap-2 pt-1"><button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-700 transition-all"><Edit2 className="w-3.5 h-3.5" />Editar</button><button onClick={() => setDelTarget(c)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 transition-all"><Trash2 className="w-3.5 h-3.5" />Excluir</button></div>
            </div>
          ))}
        </div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editOne ? 'Editar cliente' : 'Novo cliente'} size="lg" footer={<><button onClick={() => setShowModal(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">Cancelar</button><button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? <LoadingSpinner size="sm" /> : null}{editOne ? 'Atualizar' : 'Criar cliente'}</button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome" required><input type="text" value={form.nome} onChange={e => setForm(f => ({...f, nome: e.target.value}))} className={inp} /></Field>
          <Field label="CPF"><input type="text" value={form.cpf} onChange={e => setForm(f => ({...f, cpf: e.target.value}))} className={inp} placeholder="000.000.000-00" /></Field>
          <Field label="Email"><input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className={inp} /></Field>
          <Field label="Telefone"><input type="text" value={form.telefone} onChange={e => setForm(f => ({...f, telefone: e.target.value}))} className={inp} /></Field>
          <div className="sm:col-span-2"><Field label="Endereço"><input type="text" value={form.endereco} onChange={e => setForm(f => ({...f, endereco: e.target.value}))} className={inp} /></Field></div>
          <Field label="Status"><select value={form.ativo ? 'ativo' : 'inativo'} onChange={e => setForm(f => ({...f, ativo: e.target.value === 'ativo'}))} className={inp}><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select></Field>
          <div className="sm:col-span-2"><Field label="Observações"><textarea rows={3} value={form.obs} onChange={e => setForm(f => ({...f, obs: e.target.value}))} className={inp} placeholder="Preferências, detalhes de atendimento ou outras informações" /></Field></div>
        </div>
      </Modal>
      <Modal isOpen={!!delTarget} onClose={() => setDelTarget(null)} title="Excluir cliente" size="sm" footer={<><button onClick={() => setDelTarget(null)} className="rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-600 dark:bg-slate-700 dark:text-slate-300">Cancelar</button><button onClick={handleDel} disabled={deleting} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{deleting && <LoadingSpinner size="sm" />}Excluir</button></>}><p className="text-sm text-slate-600 dark:text-slate-400">Tem certeza que deseja excluir <b>{delTarget?.nome}</b>? Esta ação não pode ser desfeita.</p></Modal>
    </div>
  );
}
