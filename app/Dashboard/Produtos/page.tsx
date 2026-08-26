'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Barcode, Boxes, CheckCircle2, FileSpreadsheet, Plus, Trash2, Link as LinkIcon, Upload, X } from 'lucide-react';
import { createCategoria, createProduto, deleteProduto, getCategorias, getProdutos, saveImportedProducts } from '@/lib/api';
import { useToast } from '@/lib/context';
import LoadingSpinner from '@/components/LoadingSpinner';
import Modal from '@/components/Modal';
import type { Categoria, Produto } from '@/lib/types';
import { formatQuantity, UNIT_OPTIONS, unitShort } from '@/lib/units';
import {
  IMPORT_FIELDS,
  normalizeText,
  parseProductFile,
  prepareProductRows,
  productIdentity,
  type ColumnMapping,
  type ParsedSpreadsheet,
} from '@/lib/productImport';

type FormState = {
  nome: string;
  descricao: string;
  preco: string;
  precoCusto: string;
  estoque: string;
  estoqueMinimo: string;
  unidadeMedida: 'unidade' | 'kg' | 'litro' | 'kit';
  link: string;
  categoria: string;
  status: 'ativo' | 'inativo';
};

const INITIAL_FORM: FormState = {
  nome: '',
  descricao: '',
  preco: '',
  precoCusto: '',
  estoque: '',
  estoqueMinimo: '',
  unidadeMedida: 'unidade',
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
  const [importOpen, setImportOpen] = useState(false);
  const [parsedFile, setParsedFile] = useState<ParsedSpreadsheet | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [parsingFile, setParsingFile] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [createMissingCategories, setCreateMissingCategories] = useState(true);
  const [duplicatePolicy, setDuplicatePolicy] = useState<'skip' | 'update'>('skip');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const preparedRows = useMemo(
    () => parsedFile ? prepareProductRows(parsedFile, columnMapping) : [],
    [parsedFile, columnMapping]
  );

  const analyzedRows = useMemo(() => {
    const existingByIdentity = new Map<string, Produto>();
    produtos.forEach((produto) => productIdentity(produto).forEach((identity) => {
      if (!existingByIdentity.has(identity)) existingByIdentity.set(identity, produto);
    }));
    const seenInFile = new Set<string>();

    return preparedRows.map((row) => {
      const identities = productIdentity(row.data);
      const existing = identities.map((identity) => existingByIdentity.get(identity)).find(Boolean);
      const repeatedInFile = identities.some((identity) => seenInFile.has(identity));
      identities.forEach((identity) => seenInFile.add(identity));
      return { ...row, existing, repeatedInFile };
    });
  }, [preparedRows, produtos]);

  const importSummary = useMemo(() => ({
    ready: analyzedRows.filter((row) => row.errors.length === 0 && !row.repeatedInFile && (duplicatePolicy === 'update' || !row.existing)).length,
    invalid: analyzedRows.filter((row) => row.errors.length > 0).length,
    duplicates: analyzedRows.filter((row) => Boolean(row.existing) || row.repeatedInFile).length,
    warnings: analyzedRows.reduce((total, row) => total + row.warnings.length, 0),
  }), [analyzedRows, duplicatePolicy]);

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
    const estoque = Number(form.estoque.trim().replace(',', '.'));
    if (!form.estoque.trim() || !Number.isFinite(estoque) || estoque < 0) {
      addToast('error', 'Digite um estoque inicial válido.');
      return;
    }
    const precoCusto = form.precoCusto.trim() ? Number(form.precoCusto.trim().replace(',', '.')) : undefined;
    if (precoCusto !== undefined && (!Number.isFinite(precoCusto) || precoCusto < 0)) {
      addToast('error', 'Digite um preço de custo válido.');
      return;
    }
    const estoqueMinimo = form.estoqueMinimo.trim() ? Number(form.estoqueMinimo.trim().replace(',', '.')) : undefined;
    if (estoqueMinimo !== undefined && (!Number.isFinite(estoqueMinimo) || estoqueMinimo < 0)) {
      addToast('error', 'Digite um estoque mínimo válido.');
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
        estoque,
        estoqueMinimo,
        precoCusto,
        margemLucro: precoCusto && precoCusto > 0 ? ((preco - precoCusto) / precoCusto) * 100 : undefined,
        unidadeMedida: form.unidadeMedida,
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

  function resetImport() {
    setParsedFile(null);
    setColumnMapping({});
    setDragActive(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function closeImport() {
    if (importing) return;
    setImportOpen(false);
    resetImport();
  }

  async function selectImportFile(file?: File) {
    if (!file) return;
    setParsingFile(true);
    try {
      const parsed = await parseProductFile(file);
      setParsedFile(parsed);
      setColumnMapping(parsed.mapping);
    } catch (error) {
      resetImport();
      addToast('error', error instanceof Error ? error.message : 'Não foi possível ler a planilha.');
    } finally {
      setParsingFile(false);
    }
  }

  function changeColumnMapping(columnIndex: number, field: ColumnMapping[number]) {
    setColumnMapping((current) => {
      const next = { ...current };
      if (field !== 'ignore') {
        Object.keys(next).forEach((key) => {
          if (next[Number(key)] === field) next[Number(key)] = 'ignore';
        });
      }
      next[columnIndex] = field;
      return next;
    });
  }

  async function handleImport() {
    if (!parsedFile) return;
    const actionableRows = analyzedRows.filter((row) => row.errors.length === 0 && !row.repeatedInFile && (duplicatePolicy === 'update' || !row.existing));
    if (!actionableRows.length) {
      addToast('error', 'Não há linhas válidas para importar. Revise o mapeamento e os erros.');
      return;
    }

    setImporting(true);
    try {
      const categoryMap = new Map(categorias.map((category) => [normalizeText(category.nome), category]));
      if (createMissingCategories) {
        const names = Array.from(new Map(actionableRows.map((row) => [normalizeText(row.data.categoria), row.data.categoria])).entries())
          .filter(([normalized]) => normalized && !categoryMap.has(normalized));
        const createdCategories = await Promise.all(names.map(([, name]) => createCategoria({
          nome: name,
          descricao: 'Categoria criada automaticamente pela importação de produtos.',
          status: 'ativa',
          cor: '#2563eb',
          tags: ['importada'],
        })));
        createdCategories.forEach((category) => categoryMap.set(normalizeText(category.nome), category));
      }

      const newProducts: Array<Record<string, unknown>> = [];
      const updates: Array<{ id: string; data: Record<string, unknown> }> = [];
      const skipped = analyzedRows.filter((row) => row.errors.length === 0 && (row.repeatedInFile || (duplicatePolicy === 'skip' && Boolean(row.existing)))).length;
      actionableRows.forEach((row) => {
        const category = categoryMap.get(normalizeText(row.data.categoria));
        const data: Record<string, unknown> = {
          ...row.data,
          categoriaId: category?.id ?? null,
          origemImportacao: parsedFile.fileName,
          importadoEm: new Date().toISOString(),
        };
        if (row.existing) updates.push({ id: row.existing.id, data });
        else newProducts.push(data);
      });

      if (!newProducts.length && !updates.length) {
        addToast('error', 'Todos os produtos válidos já estão cadastrados.');
        return;
      }
      await saveImportedProducts(newProducts, updates);
      await loadData();
      setImportOpen(false);
      resetImport();
      const result = [
        newProducts.length ? `${newProducts.length} novo(s)` : '',
        updates.length ? `${updates.length} atualizado(s)` : '',
        skipped ? `${skipped} ignorado(s)` : '',
      ].filter(Boolean).join(', ');
      addToast('success', `Importação concluída: ${result}.`);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Não foi possível concluir a importação.');
    } finally {
      setImporting(false);
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
            Cadastre manualmente ou importe produtos de planilhas exportadas de sites, PDVs e outros sistemas.
          </p>
        </div>
        <div className="w-full self-start rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:w-auto sm:min-w-52">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Produtos cadastrados</p>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{produtos.length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(22rem,1fr)]">
        <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex flex-col justify-between gap-4 mb-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Produtos</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Veja os produtos já cadastrados.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button onClick={() => setImportOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-900/40">
                <Upload className="w-4 h-4" /> Importar planilha
              </button>
              <button onClick={() => setForm(INITIAL_FORM)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
                <Plus className="w-4 h-4" /> Novo produto
              </button>
            </div>
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
                    <span className="px-2 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">{money.format(Number(produto.preco))} / {unitShort(produto.unidadeMedida)}</span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"><Boxes className="h-3 w-3" />{formatQuantity(produto.estoque, produto.unidadeMedida)}</span>
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
            <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Preço de venda (R$)" required>
              <input value={form.preco} onChange={(e) => updateForm('preco', e.target.value)} inputMode="decimal" className={inputCls} placeholder="Ex.: 29,90" />
            </Field>
            <Field label="Preço referente a" required>
              <select value={form.unidadeMedida} onChange={(e) => updateForm('unidadeMedida', e.target.value)} className={inputCls}>
                {UNIT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <Field label="Estoque inicial" required>
              <input value={form.estoque} onChange={(e) => updateForm('estoque', e.target.value)} inputMode="decimal" className={inputCls} placeholder={form.unidadeMedida === 'kg' || form.unidadeMedida === 'litro' ? 'Ex.: 12,5' : 'Ex.: 20'} />
            </Field>
            <Field label="Estoque mínimo">
              <input value={form.estoqueMinimo} onChange={(e) => updateForm('estoqueMinimo', e.target.value)} inputMode="decimal" className={inputCls} placeholder="Ex.: 5" />
            </Field>
            </div>
            <Field label="Preço de custo (R$)">
              <input value={form.precoCusto} onChange={(e) => updateForm('precoCusto', e.target.value)} inputMode="decimal" className={inputCls} placeholder="Usado para calcular lucro e relatórios" />
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

      <Modal
        isOpen={importOpen}
        onClose={closeImport}
        title="Importar produtos"
        size="xl"
        footer={
          <>
            <button onClick={closeImport} disabled={importing} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
              Cancelar
            </button>
            {parsedFile && (
              <button onClick={() => fileInputRef.current?.click()} disabled={importing} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                Trocar arquivo
              </button>
            )}
            {parsedFile && (
              <button onClick={handleImport} disabled={importing || importSummary.ready === 0} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                {importing ? <LoadingSpinner size="sm" /> : <Upload className="h-4 w-4" />}
                {importing ? 'Importando...' : `Importar ${importSummary.ready} linha(s)`}
              </button>
            )}
          </>
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          className="hidden"
          onChange={(event) => void selectImportFile(event.target.files?.[0])}
        />

        {!parsedFile ? (
          <div className="space-y-5">
            <div
              onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => { event.preventDefault(); setDragActive(false); }}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                void selectImportFile(event.dataTransfer.files?.[0]);
              }}
              className={`flex min-h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'}`}
            >
              {parsingFile ? (
                <>
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 font-bold text-slate-800 dark:text-slate-100">Lendo e analisando a planilha...</p>
                </>
              ) : (
                <>
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"><FileSpreadsheet className="h-8 w-8" /></span>
                  <p className="mt-4 text-lg font-black text-slate-900 dark:text-slate-100">Arraste a planilha para cá</p>
                  <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">Use um arquivo Excel (.xlsx) ou CSV exportado do seu site, PDV, ERP ou sistema de estoque.</p>
                  <button onClick={() => fileInputRef.current?.click()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
                    <Upload className="h-4 w-4" /> Selecionar arquivo
                  </button>
                  <p className="mt-3 text-xs text-slate-400">Até 10.000 produtos por importação</p>
                </>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['1', 'Envie o arquivo', 'Excel ou CSV do sistema de origem.'],
                ['2', 'Confira as colunas', 'O sistema reconhece os campos automaticamente.'],
                ['3', 'Revise e importe', 'Você vê erros e duplicados antes de salvar.'],
              ].map(([number, title, description]) => (
                <div key={number} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                  <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{number}</span>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"><CheckCircle2 className="h-5 w-5" /></span>
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900 dark:text-slate-100">{parsedFile.fileName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{parsedFile.rows.length.toLocaleString('pt-BR')} linha(s) encontrada(s)</p>
                </div>
              </div>
              <button onClick={resetImport} disabled={importing} aria-label="Remover arquivo" className="self-end rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200 sm:self-auto"><X className="h-4 w-4" /></button>
            </div>

            <section>
              <div className="mb-3">
                <h3 className="font-black text-slate-900 dark:text-slate-100">Correspondência das colunas</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Confira o que cada coluna da planilha representa. O nome do produto é o único campo obrigatório.</p>
              </div>
              <div className="grid max-h-72 gap-3 overflow-y-auto rounded-2xl border border-slate-200 p-3 dark:border-slate-700 sm:grid-cols-2 lg:grid-cols-3">
                {parsedFile.headers.map((header, index) => (
                  <div key={`${header}-${index}`} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                    <p className="mb-2 truncate text-xs font-bold text-slate-600 dark:text-slate-300" title={header}>{header}</p>
                    <select value={columnMapping[index] ?? 'ignore'} onChange={(event) => changeColumnMapping(index, event.target.value as ColumnMapping[number])} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
                      <option value="ignore">Guardar como dado adicional</option>
                      {IMPORT_FIELDS.map((field) => <option key={field.key} value={field.key}>{field.label}{field.key === 'nome' ? ' *' : ''}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Colunas não associadas também serão preservadas no cadastro como dados originais da importação.</p>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <input type="checkbox" checked={createMissingCategories} onChange={(event) => setCreateMissingCategories(event.target.checked)} className="mt-1 h-4 w-4 accent-blue-600" />
                <span><span className="block text-sm font-bold text-slate-800 dark:text-slate-100">Criar categorias automaticamente</span><span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">Categorias novas da planilha serão adicionadas ao site.</span></span>
              </label>
              <label className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <span className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-100">Quando o produto já existir</span>
                <select value={duplicatePolicy} onChange={(event) => setDuplicatePolicy(event.target.value as 'skip' | 'update')} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
                  <option value="skip">Manter o atual e ignorar a linha</option>
                  <option value="update">Atualizar com os dados da planilha</option>
                </select>
              </label>
            </section>

            <section>
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="font-black text-slate-900 dark:text-slate-100">Prévia da importação</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Confira uma amostra antes de salvar.</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{importSummary.ready} prontas</span>
                  {importSummary.duplicates > 0 && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">{importSummary.duplicates} duplicadas</span>}
                  {importSummary.invalid > 0 && <span className="rounded-full bg-red-100 px-2.5 py-1 text-red-700 dark:bg-red-950/40 dark:text-red-300">{importSummary.invalid} com erro</span>}
                </div>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <tr><th className="px-3 py-3">Linha</th><th className="px-3 py-3">Produto</th><th className="px-3 py-3">Preço</th><th className="px-3 py-3">Estoque</th><th className="px-3 py-3">Categoria</th><th className="px-3 py-3">Situação</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {analyzedRows.slice(0, 8).map((row) => (
                      <tr key={row.sourceRow} className="text-slate-700 dark:text-slate-300">
                        <td className="px-3 py-3 text-slate-400">{row.sourceRow}</td>
                        <td className="max-w-52 px-3 py-3"><p className="truncate font-bold text-slate-900 dark:text-slate-100">{row.data.nome || 'Sem nome'}</p><p className="truncate text-xs text-slate-400">{row.data.sku || row.data.codigoBarras || 'Sem código'}</p></td>
                        <td className="whitespace-nowrap px-3 py-3">{money.format(Number(row.data.preco))}</td>
                        <td className="px-3 py-3">{formatQuantity(row.data.estoque, row.data.unidadeMedida)}</td>
                        <td className="max-w-40 truncate px-3 py-3">{row.data.categoria}</td>
                        <td className="px-3 py-3">
                          {row.errors.length > 0 ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600" title={row.errors.join(', ')}><AlertCircle className="h-3.5 w-3.5" />{row.errors[0]}</span>
                            : row.repeatedInFile ? <span className="text-xs font-semibold text-amber-600">Repetida no arquivo</span>
                            : row.existing ? <span className="text-xs font-semibold text-amber-600">Já cadastrado</span>
                            : <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" />Pronta</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {analyzedRows.length > 8 && <p className="mt-2 text-center text-xs text-slate-400">Mostrando 8 de {analyzedRows.length.toLocaleString('pt-BR')} linhas. Todas serão verificadas na importação.</p>}
              {importSummary.invalid > 0 && <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/20 dark:text-red-300"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>Linhas com erro não serão importadas. Corrija a planilha ou ajuste a correspondência das colunas.</span></div>}
            </section>
          </div>
        )}
      </Modal>

      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Excluir produto" size="sm" footer={<><button onClick={() => setDeleteTarget(null)} className="rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-600 dark:bg-slate-700 dark:text-slate-300">Cancelar</button><button onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">{deleting ? <LoadingSpinner size="sm" /> : <Trash2 className="h-4 w-4" />}Excluir</button></>}>
        <p className="text-sm text-slate-600 dark:text-slate-300">Tem certeza que deseja excluir <span className="font-semibold text-slate-900 dark:text-white">{deleteTarget?.nome}</span>? Esta ação não pode ser desfeita.</p>
      </Modal>
    </div>
  );
}
