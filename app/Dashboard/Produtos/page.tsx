'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import { createProduto, deleteProduto, getCategorias, getProdutos } from '@/lib/api';
import { useToast } from '@/lib/context';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Categoria, Produto } from '@/lib/types';

type FormState = {
  nome: string;
  descricao: string;
  preco: string;
  link: string;
  categoria: string;
  status: 'ativo' | 'inativo';
};

const INITIAL_FORM: FormState = {
  nome: '',
  descricao: '',
  preco: '',
  link: '',
  categoria: '',
  status: 'ativo',
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600';

export default function ProdutosPage() {
  const { addToast } = useToast();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Produto | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([getCategorias(), getProdutos()]);
      setCategorias(cats);
      setProdutos(prods);
    } catch (error) {
      addToast('error', 'Erro ao carregar categorias ou produtos');
    } finally {
      setLoading(false);
    }
  }

  function updateForm(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    if (!form.nome.trim()) {
      addToast('error', 'Nome é obrigatório');
      return;
    }
    if (!form.preco.trim() || Number.isNaN(Number(form.preco))) {
      addToast('error', 'Digite um preço válido');
      return;
    }
    if (!form.categoria) {
      addToast('error', 'Selecione uma categoria');
      return;
    }

    setSaving(true);
    try {
      await createProduto({
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || undefined,
        preco: Number(form.preco),
        categoria: form.categoria,
        codigoBarras: form.link.trim() || undefined,
        status: form.status,
      });
      addToast('success', 'Produto criado com sucesso');
      setForm(INITIAL_FORM);
      await loadData();
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Erro ao criar produto');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduto(deleteTarget.nome);
      addToast('success', 'Produto excluído');
      setDeleteTarget(null);
      await loadData();
    } catch {
      addToast('error', 'Erro ao excluir produto');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded">PRODUTOS</span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">Cadastro de Produtos</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
            Adicione produtos com nome, descrição, preço, link e categoria. As categorias vêm da página de categorias.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Produtos cadastrados</p>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{produtos.length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Produtos</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Veja os produtos já cadastrados.</p>
            </div>
            <button onClick={() => setForm(INITIAL_FORM)} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-700 transition-all">
              <Plus className="w-4 h-4" /> Novo produto
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40"><LoadingSpinner size="lg" /></div>
          ) : produtos.length === 0 ? (
            <div className="text-center text-slate-400 py-16">Nenhum produto cadastrado ainda.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {produtos.map((produto) => (
                <div key={produto.id} className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <p className="font-black text-slate-900 dark:text-slate-100">{produto.nome}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{produto.descricao || 'Sem descrição'}</p>
                    </div>
                    <button onClick={() => setDeleteTarget(produto)} className="text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="px-2 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">R$ {Number(produto.preco).toFixed(2)}</span>
                    <span className="px-2 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">{produto.categoria || 'Sem categoria'}</span>
                    {produto.codigoBarras && (
                      <a href={produto.codigoBarras} target="_blank" rel="noreferrer" className="px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 truncate max-w-xs block">
                        <LinkIcon className="inline-block w-3 h-3 mr-1" />{produto.codigoBarras}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Novo produto</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Preencha os dados abaixo para cadastrar um produto.</p>
          </div>
          <div className="grid gap-4">
            <Field label="Nome" required>
              <input value={form.nome} onChange={(e) => updateForm('nome', e.target.value)} className={inputCls} placeholder="Nome do produto" />
            </Field>
            <Field label="Descrição" required>
              <textarea value={form.descricao} onChange={(e) => updateForm('descricao', e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Descrição do produto" />
            </Field>
            <Field label="Preço (R$)" required>
              <input value={form.preco} onChange={(e) => updateForm('preco', e.target.value)} type="number" min="0" step="0.01" className={inputCls} placeholder="Ex: 29.90" />
            </Field>
            <Field label="Link do produto">
              <input value={form.link} onChange={(e) => updateForm('link', e.target.value)} className={inputCls} placeholder="https://..." />
            </Field>
            <Field label="Categoria" required>
              <select value={form.categoria} onChange={(e) => updateForm('categoria', e.target.value)} className={inputCls}>
                <option value="">Selecione a categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.nome}>{categoria.nome}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => updateForm('status', e.target.value as FormState['status'])} className={inputCls}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </Field>
            <button onClick={handleSave} disabled={saving || categorias.length === 0} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? <LoadingSpinner size="sm" /> : <Plus className="w-4 h-4" />} {saving ? 'Salvando...' : 'Cadastrar produto'}
            </button>
            {categorias.length === 0 && (
              <p className="text-sm text-amber-600">Cadastre primeiro uma categoria na página de categorias para poder associar ao produto.</p>
            )}
          </div>
        </section>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Excluir produto</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">Tem certeza que deseja excluir <span className="font-semibold text-slate-900 dark:text-white">{deleteTarget.nome}</span>?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Cancelar</button>
              <button onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50">
                {deleting ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />} Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
