'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  Download,
  PackageSearch,
  Plus,
  ShoppingBag,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { createDespesa, deleteDespesa, getClientes, getDespesas, getHistorico, getProdutos } from '@/lib/api';
import type { Cliente, Despesa, Produto, Venda } from '@/lib/types';
import { useToast } from '@/lib/context';
import LoadingSpinner from '@/components/LoadingSpinner';
import Modal from '@/components/Modal';
import { formatQuantity } from '@/lib/units';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const shortDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });

const EXPENSE_CATEGORIES: Array<{ value: Despesa['categoria']; label: string }> = [
  { value: 'aluguel', label: 'Aluguel' },
  { value: 'energia', label: 'Energia' },
  { value: 'agua', label: 'Água' },
  { value: 'internet', label: 'Internet' },
  { value: 'fornecedores', label: 'Fornecedores' },
  { value: 'salarios', label: 'Salários' },
  { value: 'impostos', label: 'Impostos e taxas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'outros', label: 'Outros' },
];

const PAYMENT_LABELS: Record<string, string> = {
  dinheiro: 'Dinheiro', pix: 'Pix', credito: 'Crédito', debito: 'Débito', boleto: 'Boleto', transferencia: 'Transferência', outro: 'Outro',
};

function localDateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function initialPeriod() {
  const today = new Date();
  return {
    start: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`,
    end: localDateKey(today),
  };
}

function categoryLabel(value: Despesa['categoria']) {
  return EXPENSE_CATEGORIES.find((item) => item.value === value)?.label || 'Outros';
}

function MetricCard({ label, value, detail, icon: Icon, tone = 'blue' }: { label: string; value: string; detail: string; icon: typeof BarChart3; tone?: 'blue' | 'green' | 'red' | 'amber' | 'slate' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    red: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  };
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</p><p className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">{value}</p><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{detail}</p></div><span className={`rounded-xl p-2.5 ${tones[tone]}`}><Icon className="h-5 w-5" /></span></div></div>;
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return <div><h2 className="text-lg font-black text-slate-950 dark:text-white">{title}</h2><p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p></div>;
}

function SmallMetric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div className="min-w-0 px-4 py-3"><p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p><p className="mt-1 truncate text-lg font-black text-slate-900 dark:text-white">{value}</p>{detail && <p className="mt-0.5 text-xs text-slate-400">{detail}</p>}</div>;
}

function Distribution({ items, color = 'bg-blue-600' }: { items: Array<{ label: string; value: number }>; color?: string }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return <div className="space-y-3">{items.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">Nenhum dado no período.</p> : items.map((item) => <div key={item.label}><div className="mb-1 flex items-center justify-between gap-3 text-sm"><span className="truncate font-medium text-slate-700 dark:text-slate-200">{item.label}</span><span className="shrink-0 font-bold text-slate-900 dark:text-white">{money.format(item.value)}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }} /></div></div>)}</div>;
}

export default function RelatoriosPage() {
  const { addToast } = useToast();
  const period = useMemo(initialPeriod, []);
  const [startDate, setStartDate] = useState(period.start);
  const [endDate, setEndDate] = useState(period.end);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingExpense, setSavingExpense] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Despesa | null>(null);
  const [expenseForm, setExpenseForm] = useState({ descricao: '', categoria: 'fornecedores' as Despesa['categoria'], valor: '', data: localDateKey(new Date()), formaPagamento: 'pix' as NonNullable<Despesa['formaPagamento']>, recorrente: false, observacao: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [loadedProdutos, loadedVendas, loadedClientes, loadedDespesas] = await Promise.all([getProdutos(), getHistorico(), getClientes(), getDespesas()]);
      setProdutos(loadedProdutos); setVendas(loadedVendas); setClientes(loadedClientes); setDespesas(loadedDespesas);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Não foi possível carregar os relatórios.');
    } finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { void load(); }, [load]);

  const report = useMemo(() => {
    const filteredSales = vendas.filter((sale) => { const date = localDateKey(sale.criadoEm); return (!startDate || date >= startDate) && (!endDate || date <= endDate) && sale.status === 'concluida'; });
    const filteredExpenses = despesas.filter((expense) => (!startDate || expense.data >= startDate) && (!endDate || expense.data <= endDate));
    const productsById = new Map(produtos.map((product) => [product.id, product]));
    const productMap = new Map<string, { nome: string; quantidade: number; unidade?: string; faturamento: number; custo: number; lucro: number }>();
    const categoryMap = new Map<string, number>();
    const paymentMap = new Map<string, number>();
    const customerMap = new Map<string, number>();
    let revenue = 0; let discounts = 0; let estimatedCost = 0; let soldQuantity = 0;

    filteredSales.forEach((sale) => {
      revenue += Number(sale.total) || 0; discounts += Number(sale.desconto) || 0;
      paymentMap.set(sale.metodoPagamento, (paymentMap.get(sale.metodoPagamento) || 0) + Number(sale.total || 0));
      if (sale.clienteNome) customerMap.set(sale.clienteNome, (customerMap.get(sale.clienteNome) || 0) + Number(sale.total || 0));
      sale.itens.forEach((item) => {
        const product = productsById.get(item.produtoId);
        const itemCost = (Number(product?.precoCusto) || 0) * Number(item.quantidade || 0);
        const itemRevenue = Number(item.subtotal) || 0;
        estimatedCost += itemCost; soldQuantity += Number(item.quantidade) || 0;
        categoryMap.set(item.categoria || 'Sem categoria', (categoryMap.get(item.categoria || 'Sem categoria') || 0) + itemRevenue);
        const current = productMap.get(item.produtoId) || { nome: item.nome, quantidade: 0, unidade: item.unidadeMedida || product?.unidadeMedida, faturamento: 0, custo: 0, lucro: 0 };
        current.quantidade += Number(item.quantidade) || 0; current.faturamento += itemRevenue; current.custo += itemCost; current.lucro += itemRevenue - itemCost;
        productMap.set(item.produtoId, current);
      });
    });

    const operationalExpenses = filteredExpenses.reduce((sum, expense) => sum + Number(expense.valor || 0), 0);
    const grossProfit = revenue - estimatedCost;
    const netResult = grossProfit - operationalExpenses;
    const inventoryCost = produtos.reduce((sum, product) => sum + (Number(product.estoque) || 0) * (Number(product.precoCusto) || 0), 0);
    const inventorySaleValue = produtos.reduce((sum, product) => sum + (Number(product.estoque) || 0) * (Number(product.preco) || 0), 0);
    const lowStock = produtos.filter((product) => Number(product.estoqueMinimo) > 0 && Number(product.estoque) <= Number(product.estoqueMinimo));
    const outOfStock = produtos.filter((product) => Number(product.estoque) <= 0);
    const expenseCategoryMap = new Map<string, number>();
    filteredExpenses.forEach((expense) => expenseCategoryMap.set(categoryLabel(expense.categoria), (expenseCategoryMap.get(categoryLabel(expense.categoria)) || 0) + Number(expense.valor || 0)));
    const sortMap = (map: Map<string, number>) => Array.from(map, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    return {
      filteredSales, filteredExpenses, revenue, discounts, estimatedCost, operationalExpenses, grossProfit, netResult,
      ticket: filteredSales.length ? revenue / filteredSales.length : 0,
      grossMargin: revenue ? (grossProfit / revenue) * 100 : 0,
      salesCount: filteredSales.length, soldQuantity,
      uniqueCustomers: new Set(filteredSales.map((sale) => sale.clienteId).filter(Boolean)).size,
      inventoryCost, inventorySaleValue, lowStock, outOfStock,
      products: Array.from(productMap.values()).sort((a, b) => b.faturamento - a.faturamento),
      categories: sortMap(categoryMap), payments: sortMap(paymentMap), customers: sortMap(customerMap), expenseCategories: sortMap(expenseCategoryMap),
    };
  }, [despesas, endDate, produtos, startDate, vendas]);

  async function saveExpense(event: FormEvent) {
    event.preventDefault();
    const value = Number(expenseForm.valor.replace(',', '.'));
    if (expenseForm.descricao.trim().length < 2 || !Number.isFinite(value) || value <= 0 || !expenseForm.data) {
      addToast('error', 'Preencha a descrição, a data e um valor maior que zero.'); return;
    }
    setSavingExpense(true);
    try {
      const created = await createDespesa({ ...expenseForm, descricao: expenseForm.descricao.trim(), valor: value, observacao: expenseForm.observacao.trim() || null });
      setDespesas((current) => [created, ...current]);
      setExpenseForm((current) => ({ ...current, descricao: '', valor: '', observacao: '', recorrente: false }));
      addToast('success', 'Despesa registrada no relatório.');
    } catch (error) { addToast('error', error instanceof Error ? error.message : 'Não foi possível registrar a despesa.'); }
    finally { setSavingExpense(false); }
  }

  async function confirmDeleteExpense() {
    if (!deleteTarget) return;
    try { await deleteDespesa(deleteTarget.id); setDespesas((current) => current.filter((item) => item.id !== deleteTarget.id)); setDeleteTarget(null); addToast('success', 'Despesa removida.'); }
    catch { addToast('error', 'Não foi possível remover a despesa.'); }
  }

  function exportReport() {
    const cell = (value: unknown) => { const raw = String(value ?? ''); const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw; return `"${safe.replace(/"/g, '""')}"`; };
    const rows: unknown[][] = [
      ['RELATÓRIO CORTEXAI', `${startDate || 'início'} a ${endDate || 'hoje'}`], [],
      ['Indicador', 'Valor'], ['Faturamento', report.revenue], ['Custo estimado dos produtos', report.estimatedCost], ['Despesas operacionais', report.operationalExpenses], ['Resultado líquido estimado', report.netResult], ['Ticket médio', report.ticket], ['Vendas', report.salesCount], ['Descontos', report.discounts], [],
      ['Produto', 'Quantidade', 'Faturamento', 'Custo estimado', 'Lucro bruto'], ...report.products.map((item) => [item.nome, item.quantidade, item.faturamento, item.custo, item.lucro]), [],
      ['Despesa', 'Categoria', 'Data', 'Valor'], ...report.filteredExpenses.map((item) => [item.descricao, categoryLabel(item.categoria), item.data, item.valor]),
    ];
    const csv = rows.map((row) => row.map(cell).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `relatorio-${startDate}-${endDate}.csv`; anchor.click(); URL.revokeObjectURL(url);
  }

  if (loading) return <div className="dashboard-page flex min-h-[60vh] items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="dashboard-page space-y-8">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2"><BarChart3 className="h-6 w-6 text-blue-600" /><h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white md:text-3xl">Relatórios</h1></div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Entenda quanto a empresa vendeu, gastou e ganhou no período.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Período analisado</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="text-xs font-medium text-slate-500">Data inicial<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></label>
            <label className="text-xs font-medium text-slate-500">Data final<input type="date" value={endDate} min={startDate} onChange={(event) => setEndDate(event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></label>
            <button type="button" onClick={exportReport} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700"><Download className="h-4 w-4" />Baixar relatório</button>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <SectionTitle title="Visão geral" description="Os quatro números mais importantes para acompanhar o resultado da empresa." />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total vendido" value={money.format(report.revenue)} detail={`${report.salesCount} venda(s) concluída(s)`} icon={TrendingUp} tone="green" />
          <MetricCard label="Custo dos itens vendidos" value={money.format(report.estimatedCost)} detail="Calculado usando o preço de custo cadastrado" icon={ShoppingBag} tone="amber" />
          <MetricCard label="Gastos da empresa" value={money.format(report.operationalExpenses)} detail={`${report.filteredExpenses.length} gasto(s) registrado(s)`} icon={TrendingDown} tone="red" />
          <MetricCard label="Saldo estimado" value={money.format(report.netResult)} detail="Total vendido menos custos e gastos" icon={CircleDollarSign} tone={report.netResult >= 0 ? 'green' : 'red'} />
        </div>
        <div className="grid divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
          <SmallMetric label="Lucro antes dos gastos" value={money.format(report.grossProfit)} detail={`${report.grossMargin.toFixed(1)}% de margem estimada`} />
          <SmallMetric label="Valor médio por venda" value={money.format(report.ticket)} detail={`${report.uniqueCustomers} cliente(s) identificado(s)`} />
          <SmallMetric label="Descontos aplicados" value={money.format(report.discounts)} />
          <SmallMetric label="Clientes cadastrados" value={String(clientes.length)} detail={`${clientes.filter((client) => client.ativo !== false).length} ativo(s)`} />
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle title="De onde o dinheiro veio e para onde foi" description="Veja o que mais vendeu, como os clientes pagaram e quais gastos pesaram mais." />
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"><h3 className="mb-1 font-black text-slate-900 dark:text-white">Categorias que mais venderam</h3><p className="mb-5 text-xs text-slate-500">Valor vendido por categoria de produto.</p><Distribution items={report.categories} /></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"><h3 className="mb-1 font-black text-slate-900 dark:text-white">Como os clientes pagaram</h3><p className="mb-5 text-xs text-slate-500">Valor recebido em cada forma de pagamento.</p><Distribution items={report.payments.map((item) => ({ ...item, label: PAYMENT_LABELS[item.label] || item.label }))} color="bg-violet-600" /></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"><h3 className="mb-1 font-black text-slate-900 dark:text-white">Gastos por tipo</h3><p className="mb-5 text-xs text-slate-500">Categorias que mais consumiram dinheiro.</p><Distribution items={report.expenseCategories} color="bg-red-500" /></div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle title="Produtos, clientes e estoque" description="Descubra o que mais vende, quem mais compra e quais itens precisam de atenção." />
        <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"><div className="border-b border-slate-100 p-5 dark:border-slate-700"><h3 className="font-black text-slate-900 dark:text-white">Produtos que mais geraram vendas</h3><p className="text-xs text-slate-500">Ordenados pelo valor vendido no período.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-400 dark:bg-slate-900/50"><tr><th className="px-4 py-3">Produto</th><th className="px-4 py-3">Quantidade vendida</th><th className="px-4 py-3 text-right">Total vendido</th><th className="px-4 py-3 text-right">Custo estimado</th><th className="px-4 py-3 text-right">Lucro antes dos gastos</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700">{report.products.slice(0, 15).map((item) => <tr key={item.nome}><td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{item.nome}</td><td className="px-4 py-3 text-slate-500">{formatQuantity(item.quantidade, item.unidade)}</td><td className="px-4 py-3 text-right font-bold">{money.format(item.faturamento)}</td><td className="px-4 py-3 text-right text-amber-600">{money.format(item.custo)}</td><td className={`px-4 py-3 text-right font-black ${item.lucro >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{money.format(item.lucro)}</td></tr>)}</tbody></table>{report.products.length === 0 && <p className="py-10 text-center text-sm text-slate-500">Nenhuma venda encontrada neste período.</p>}</div></div>
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"><div className="mb-4 flex items-center gap-2"><PackageSearch className="h-5 w-5 text-blue-600" /><div><h3 className="font-black text-slate-900 dark:text-white">Situação atual do estoque</h3><p className="text-xs text-slate-500">Valores e produtos que precisam de reposição.</p></div></div><div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50"><p className="text-xs text-slate-500">Valor investido</p><p className="mt-1 font-black">{money.format(report.inventoryCost)}</p></div><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50"><p className="text-xs text-slate-500">Valor possível em vendas</p><p className="mt-1 font-black">{money.format(report.inventorySaleValue)}</p></div><div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30"><p className="text-xs text-amber-700">Precisam de reposição</p><p className="mt-1 font-black text-amber-800 dark:text-amber-300">{report.lowStock.length}</p></div><div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/30"><p className="text-xs text-red-700">Produtos zerados</p><p className="mt-1 font-black text-red-800 dark:text-red-300">{report.outOfStock.length}</p></div></div>{report.lowStock.length > 0 && <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 p-3 text-xs text-amber-800 dark:border-amber-800 dark:text-amber-300"><AlertTriangle className="h-4 w-4 shrink-0" /><span>Repor: {report.lowStock.slice(0, 5).map((item) => item.nome).join(', ')}</span></div>}</div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"><h3 className="mb-1 font-black text-slate-900 dark:text-white">Clientes que mais compraram</h3><p className="mb-5 text-xs text-slate-500">Os cinco clientes com maior valor em compras.</p><Distribution items={report.customers.slice(0, 5)} color="bg-emerald-600" /></div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle title="Gastos da empresa" description="Registre os gastos para que o saldo estimado fique mais próximo da realidade." />
        <div className="grid gap-5 xl:grid-cols-[24rem_1fr]">
        <form onSubmit={saveExpense} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"><div className="mb-5 flex items-center gap-2"><Plus className="h-5 w-5 text-blue-600" /><div><h3 className="font-black text-slate-900 dark:text-white">Adicionar um gasto</h3><p className="text-xs text-slate-500">Informe uma conta, compra ou outro custo da empresa.</p></div></div><div className="space-y-3"><label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Descrição do gasto<input value={expenseForm.descricao} onChange={(event) => setExpenseForm({ ...expenseForm, descricao: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="Ex.: Conta de energia" /></label><div className="grid grid-cols-2 gap-3"><label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Valor (R$)<input value={expenseForm.valor} onChange={(event) => setExpenseForm({ ...expenseForm, valor: event.target.value })} inputMode="decimal" className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="0,00" /></label><label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Data do gasto<input type="date" value={expenseForm.data} onChange={(event) => setExpenseForm({ ...expenseForm, data: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900" /></label></div><label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Tipo de gasto<select value={expenseForm.categoria} onChange={(event) => setExpenseForm({ ...expenseForm, categoria: event.target.value as Despesa['categoria'] })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900">{EXPENSE_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Como foi pago<select value={expenseForm.formaPagamento} onChange={(event) => setExpenseForm({ ...expenseForm, formaPagamento: event.target.value as NonNullable<Despesa['formaPagamento']> })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900">{Object.entries(PAYMENT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><input type="checkbox" checked={expenseForm.recorrente} onChange={(event) => setExpenseForm({ ...expenseForm, recorrente: event.target.checked })} className="h-4 w-4 rounded border-slate-300" />Este gasto se repete</label><label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Observação (opcional)<textarea value={expenseForm.observacao} onChange={(event) => setExpenseForm({ ...expenseForm, observacao: event.target.value })} rows={2} className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900" /></label><button disabled={savingExpense} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50">{savingExpense ? <LoadingSpinner size="sm" /> : <Plus className="h-4 w-4" />}Salvar gasto</button></div></form>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"><div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-700"><div><h3 className="font-black text-slate-900 dark:text-white">Gastos registrados neste período</h3><p className="text-xs text-slate-500">Estes valores são descontados do saldo estimado.</p></div><CalendarDays className="h-5 w-5 text-slate-400" /></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-400 dark:bg-slate-900/50"><tr><th className="px-4 py-3">Data</th><th className="px-4 py-3">Gasto</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Pagamento</th><th className="px-4 py-3 text-right">Valor</th><th className="px-4 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700">{report.filteredExpenses.map((expense) => <tr key={expense.id}><td className="whitespace-nowrap px-4 py-3 text-slate-500">{shortDate.format(new Date(`${expense.data}T12:00:00`))}</td><td className="px-4 py-3"><p className="font-semibold text-slate-800 dark:text-slate-200">{expense.descricao}</p>{expense.recorrente && <span className="text-[10px] font-bold uppercase text-blue-600">Recorrente</span>}</td><td className="px-4 py-3 text-slate-500">{categoryLabel(expense.categoria)}</td><td className="px-4 py-3 text-slate-500">{PAYMENT_LABELS[expense.formaPagamento || 'outro']}</td><td className="px-4 py-3 text-right font-black text-red-600">{money.format(expense.valor)}</td><td className="px-4 py-3 text-right"><button type="button" onClick={() => setDeleteTarget(expense)} aria-label={`Excluir ${expense.descricao}`} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"><Trash2 className="h-4 w-4" /></button></td></tr>)}</tbody></table>{report.filteredExpenses.length === 0 && <p className="py-12 text-center text-sm text-slate-500">Nenhum gasto registrado neste período.</p>}</div></div>
        </div>
      </section>

      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Excluir despesa" size="sm" footer={<><button type="button" onClick={() => setDeleteTarget(null)} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-200">Cancelar</button><button type="button" onClick={confirmDeleteExpense} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">Excluir</button></>}><p className="text-sm text-slate-600 dark:text-slate-300">Remover a despesa <strong>{deleteTarget?.descricao}</strong> do relatório?</p></Modal>
    </div>
  );
}
