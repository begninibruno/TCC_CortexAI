'use client';

import { useCallback, useEffect, useState } from 'react';
import { Barcode, Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import { createProduto, deleteProduto, getCategorias, getProdutos } from '@/lib/api';
import { useToast } from '@/lib/context';
import LoadingSpinner from '@/components/LoadingSpinner';
import Modal from '@/components/Modal';
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

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

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

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([getCategorias(), getProdutos()]);
      setCategorias(cats);
      setProdutos(prods);
    } catch {
      addToast('error', 'Erro ao carregar categorias ou produtos');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function updateForm(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    if (!form.nome.trim()) {
      addToast('error', 'Nome é obrigatório');
      return;
    }
    const preco = Number(form.preco.trim().replace(',', '.'));
    if (!form.preco.trim() || Number.isNaN(preco) || preco < 0) {
      addToast('error', 'Digite um preço válido');
      return;
    }
    if (!form.categoria) {
      addToast('error', 'Selecione uma categoria');
      return;
    }

    const categoriaSelecionada = categorias.find((categoria) => categoria.id === form.categoria);
    if (!categoriaSelecionada) {
      addToast('error', 'Selecione uma categoria válida.');
      return;
    }
    const link = form.link.trim();
    if (link) {
      try {
        const url = new URL(link);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
      } catch {
        addToast('error', 'Informe um link válido com http:// ou https://.');
        return;
      }
    }

    setSaving(true);
    try {
      const createdProduto = await createProduto({
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || undefined,
        preco,
        estoque: 0,
        categoria: categoriaSelecionada.nome,
        categoriaId: categoriaSelecionada.id,
        linkProduto: link || undefined,
        status: form.status,
      });
      setProdutos((current) => [...current, createdProduto]);
      addToast('success', 'Produto cadastrado com sucesso.');
      setForm(INITIAL_FORM);
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
      await deleteProduto(deleteTarget.id);
      setProdutos((current) => current.filter((produto) => produto.id !== deleteTarget.id));
      addToast('success', 'Produto excluído');
      setDeleteTarget(null);
    } catch {
      addToast('error', 'Erro ao excluir produto');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="dashboard-page space-y-6">
      <div className="flex flex-col items-start gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">Produtos</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
            Adicione produtos com nome, descrição, preço, link e categoria. As categorias vêm da página de categorias.
          </p>
        </div>
        <div className="w-full self-start rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:w-auto sm:min-w-52">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Produtos cadastrados</p>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{produtos.length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(22rem,1fr)]">
        <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Produtos</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Veja os produtos já cadastrados.</p>
            </div>
            <button onClick={() => setForm(INITIAL_FORM)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
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
                    <button onClick={() => setDeleteTarget(produto)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30" aria-label={`Excluir ${produto.nome}`}>
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="px-2 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">{money.format(Number(produto.preco))}</span>
                    <span className="px-2 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">{produto.categoria || 'Sem categoria'}</span>
                    {produto.linkProduto && (
                      <a href={produto.linkProduto} target="_blank" rel="noreferrer" className="block max-w-xs truncate rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                        <LinkIcon className="mr-1 inline-block h-3 w-3" />Abrir produto
                      </a>
                    )}
                    {produto.codigoBarras && <span className="rounded-full border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"><Barcode className="mr-1 inline-block h-3 w-3" />{produto.codigoBarras}</span>}
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
            <Field label="Descrição">
              <textarea value={form.descricao} onChange={(e) => updateForm('descricao', e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Descrição do produto" />
            </Field>
            <Field label="Preço (R$)" required>
              <input value={form.preco} onChange={(e) => updateForm('preco', e.target.value)} inputMode="decimal" className={inputCls} placeholder="Ex.: 29,90" />
            </Field>
            <Field label="Link do produto">
              <input value={form.link} onChange={(e) => updateForm('link', e.target.value)} className={inputCls} placeholder="https://..." />
            </Field>
            <Field label="Categoria" required>
              <select value={form.categoria} onChange={(e) => updateForm('categoria', e.target.value)} className={inputCls}>
                <option value="">Selecione a categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => updateForm('status', e.target.value as FormState['status'])} className={inputCls}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </Field>
            <button onClick={handleSave} disabled={saving || categorias.length === 0} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <LoadingSpinner size="sm" /> : <Plus className="w-4 h-4" />} {saving ? 'Salvando...' : 'Cadastrar produto'}
            </button>
            {categorias.length === 0 && (
              <p className="text-sm text-amber-600">Cadastre primeiro uma categoria na página de categorias para poder associar ao produto.</p>
            )}
          </div>
        </section>
      </div>

      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Excluir produto" size="sm" footer={<><button onClick={() => setDeleteTarget(null)} className="rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-600 dark:bg-slate-700 dark:text-slate-300">Cancelar</button><button onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">{deleting ? <LoadingSpinner size="sm" /> : <Trash2 className="h-4 w-4" />}Excluir</button></>}>
        <p className="text-sm text-slate-600 dark:text-slate-300">Tem certeza que deseja excluir <span className="font-semibold text-slate-900 dark:text-white">{deleteTarget?.nome}</span>? Esta ação não pode ser desfeita.</p>
      </Modal>
    </div>
  );
}
