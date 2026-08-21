'use client';

import { useCallback, useEffect, useState } from 'react';
import { Edit2, Plus, Tag, Trash2 } from 'lucide-react';
import { createCategoria, deleteCategoria, getCategorias, updateCategoria } from '@/lib/api';
import { useToast } from '@/lib/context';
import type { Categoria } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import Modal from '@/components/Modal';

type CategoryForm = {
  nome: string; descricao: string; tipoProduto: string; classificacaoBebida: string;
  icone: string; cor: string; margemLucroPadrao: string; metaVendasMensais: string;
  comissaoPorVenda: string; ordemExibicao: string; status: 'ativa' | 'inativa'; tags: string;
};
const EMPTY_FORM: CategoryForm = { nome: '', descricao: '', tipoProduto: '', classificacaoBebida: '', icone: '', cor: '#4f46e5', margemLucroPadrao: '', metaVendasMensais: '', comissaoPorVenda: '', ordemExibicao: '', status: 'ativa', tags: '' };
const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100';

export default function CategoriasPage() {
  const { addToast } = useToast();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Categoria | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setCategorias(await getCategorias());
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Não foi possível carregar as categorias.');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(category: Categoria) {
    setEditing(category);
    setForm({ nome: category.nome, descricao: category.descricao ?? '', tipoProduto: category.tipoProduto ?? '', classificacaoBebida: category.classificacaoBebida ?? '', icone: category.icone ?? '', cor: category.cor ?? '#4f46e5', margemLucroPadrao: category.margemLucroPadrao?.toString() ?? '', metaVendasMensais: category.metaVendasMensais?.toString() ?? '', comissaoPorVenda: category.comissaoPorVenda?.toString() ?? '', ordemExibicao: category.ordemExibicao?.toString() ?? '', status: category.status ?? 'ativa', tags: Array.isArray(category.tags) ? category.tags.join(', ') : category.tags ?? '' });
    setFormOpen(true);
  }

  async function saveCategory() {
    const nome = form.nome.trim();
    if (!nome) {
      addToast('error', 'Informe o nome da categoria.');
      return;
    }
    setSaving(true);
    try {
      const data = {
        nome,
        descricao: form.descricao.trim() || null,
        tipoProduto: form.tipoProduto || null,
        classificacaoBebida: form.tipoProduto === 'bebida' ? form.classificacaoBebida || null : null,
        icone: form.icone || null,
        cor: form.cor,
        margemLucroPadrao: form.margemLucroPadrao ? Number(form.margemLucroPadrao) : null,
        metaVendasMensais: form.metaVendasMensais ? Number(form.metaVendasMensais) : null,
        comissaoPorVenda: form.comissaoPorVenda ? Number(form.comissaoPorVenda) : null,
        ordemExibicao: form.ordemExibicao ? Number(form.ordemExibicao) : null,
        status: form.status,
        tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      };
      if (editing) {
        await updateCategoria({ id: editing.id, ...data });
        await loadCategories();
        addToast('success', 'Categoria atualizada.');
      } else {
        const createdCategory = await createCategoria(data);
        setCategorias((current) => [...current, createdCategory]);
        addToast('success', 'Categoria cadastrada com sucesso.');
      }
      setForm(EMPTY_FORM);
      setFormOpen(false);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Não foi possível salvar a categoria.');
    } finally {
      setSaving(false);
    }
  }

  async function removeCategory() {
    if (!deletingCategory) return;
    setDeleting(true);
    try {
      await deleteCategoria(deletingCategory.id);
      setCategorias((current) => current.filter((category) => category.id !== deletingCategory.id));
      setDeletingCategory(null);
      addToast('success', 'Categoria excluída.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Não foi possível excluir a categoria.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="dashboard-page space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Categorias</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Organize os seus produtos por categoria.</p>
        </div>
        <button onClick={openCreate} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 sm:w-auto">
          <Plus className="h-4 w-4" /> Nova categoria
        </button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center"><LoadingSpinner size="lg" /></div>
      ) : categorias.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400">
          <Tag className="h-9 w-9" />
          <p className="font-semibold text-slate-700 dark:text-slate-200">Nenhuma categoria cadastrada</p>
          <p className="max-w-sm text-center text-sm">Crie categorias para organizar os produtos e facilitar as vendas.</p>
          <button onClick={openCreate} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Criar categoria</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categorias.map((category) => (
            <article key={category.id} className="flex min-h-36 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${category.cor || '#2563eb'}18`, color: category.cor || '#2563eb' }}>{category.icone || <Tag className="h-5 w-5" />}</span>
              <h2 className="truncate font-bold text-slate-900 dark:text-slate-100">{category.nome}</h2>
              <p className="mt-1 min-h-10 text-sm leading-5 text-slate-500 dark:text-slate-400">{category.descricao || 'Sem descrição'}</p>
              <span className={`mt-3 w-fit rounded-full px-2 py-1 text-[11px] font-semibold ${category.status === 'inativa' ? 'bg-slate-100 text-slate-500 dark:bg-slate-700' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'}`}>{category.status === 'inativa' ? 'Inativa' : 'Ativa'}</span>
              <div className="mt-auto flex gap-2 pt-4">
                <button onClick={() => openEdit(category)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-slate-700 dark:text-slate-200">
                  <Edit2 className="h-3.5 w-3.5" /> Editar
                </button>
                <button onClick={() => setDeletingCategory(category)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-red-100 hover:text-red-700 dark:bg-slate-700 dark:text-slate-200">
                  <Trash2 className="h-3.5 w-3.5" /> Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Editar categoria' : 'Nova categoria'} size="md" footer={<><button onClick={() => setFormOpen(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">Cancelar</button><button onClick={saveCategory} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">{saving && <LoadingSpinner size="sm" />}{saving ? 'Salvando...' : 'Salvar'}</button></>}>
        <div className="space-y-4">
          <div><label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nome <span className="text-red-600">*</span></label><input autoFocus value={form.nome} onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))} className={inputClass} placeholder="Ex.: Bebidas" /></div>
          <div><label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Descrição</label><textarea value={form.descricao} onChange={(event) => setForm((current) => ({ ...current, descricao: event.target.value }))} rows={3} className={inputClass} placeholder="Ex.: Produtos para beber" /></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de produto</label><select value={form.tipoProduto} onChange={(event) => setForm((current) => ({ ...current, tipoProduto: event.target.value, classificacaoBebida: event.target.value === 'bebida' ? current.classificacaoBebida : '' }))} className={inputClass}><option value="">Selecionar...</option><option value="bebida">Bebida</option><option value="comida">Comida</option><option value="eletronico">Eletrônico</option><option value="outro">Outro</option></select></div>
            {form.tipoProduto === 'bebida' && <div><label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Classificação</label><select value={form.classificacaoBebida} onChange={(event) => setForm((current) => ({ ...current, classificacaoBebida: event.target.value }))} className={inputClass}><option value="">Selecionar...</option><option value="normal">Normal</option><option value="alcoolica">Alcoólica</option><option value="refrigerada">Refrigerada</option></select></div>}
            <div><label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Ícone / emoji</label><input value={form.icone} onChange={(event) => setForm((current) => ({ ...current, icone: event.target.value }))} className={inputClass} placeholder="🏷️" maxLength={4} /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Cor</label><input type="color" value={form.cor} onChange={(event) => setForm((current) => ({ ...current, cor: event.target.value }))} className="h-10 w-full rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-600 dark:bg-slate-900" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Margem padrão (%)</label><input type="number" min="0" step="0.1" value={form.margemLucroPadrao} onChange={(event) => setForm((current) => ({ ...current, margemLucroPadrao: event.target.value }))} className={inputClass} /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Meta mensal (R$)</label><input type="number" min="0" step="0.01" value={form.metaVendasMensais} onChange={(event) => setForm((current) => ({ ...current, metaVendasMensais: event.target.value }))} className={inputClass} /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Comissão (%)</label><input type="number" min="0" step="0.1" value={form.comissaoPorVenda} onChange={(event) => setForm((current) => ({ ...current, comissaoPorVenda: event.target.value }))} className={inputClass} /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Ordem de exibição</label><input type="number" min="0" value={form.ordemExibicao} onChange={(event) => setForm((current) => ({ ...current, ordemExibicao: event.target.value }))} className={inputClass} /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label><select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as CategoryForm['status'] }))} className={inputClass}><option value="ativa">Ativa</option><option value="inativa">Inativa</option></select></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tags</label><input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} className={inputClass} placeholder="gelado, premium" /></div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={Boolean(deletingCategory)} onClose={() => setDeletingCategory(null)} title="Excluir categoria" size="sm" footer={<><button onClick={() => setDeletingCategory(null)} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">Cancelar</button><button onClick={removeCategory} disabled={deleting} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{deleting && <LoadingSpinner size="sm" />}Excluir</button></>}>
        <p className="text-sm text-slate-600 dark:text-slate-300">Deseja excluir a categoria <strong>{deletingCategory?.nome}</strong>?</p>
      </Modal>
    </div>
  );
}
