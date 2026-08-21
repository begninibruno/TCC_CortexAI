'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  History,
  Minus,
  Package,
  Pencil,
  Plus,
  QrCode,
  ReceiptText,
  Search,
  ShoppingCart,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { atualizarVenda, getClientes, getHistorico, getProdutos, registrarVenda } from '@/lib/api';
import { useToast } from '@/lib/context';
import type { Cliente, Produto, Venda } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const paymentLabels: Record<Venda['metodoPagamento'], string> = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  credito: 'Cartão de crédito',
  debito: 'Cartão de débito',
  outro: 'Outro',
};

function availableStock(produto: Produto) {
  const estoque = Number(produto.estoque);
  return Number.isFinite(estoque) && estoque >= 0 ? Math.trunc(estoque) : 0;
}

function localDateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function DashboardVendasPage() {
  const { addToast } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [editingPrices, setEditingPrices] = useState<Record<string, number>>({});
  const [editingVenda, setEditingVenda] = useState<Venda | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState<Venda['metodoPagamento']>('pix');
  const [desconto, setDesconto] = useState('');
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [loadedProdutos, loadedClientes, loadedVendas] = await Promise.all([
        getProdutos(),
        getClientes(),
        getHistorico(),
      ]);
      setProdutos(loadedProdutos);
      setClientes(loadedClientes.filter((cliente) => cliente.ativo !== false));
      setVendas(loadedVendas);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Não foi possível carregar a página de vendas.');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const categorias = useMemo(() => Array.from(new Set(produtos.map((produto) => produto.categoria).filter(Boolean))).sort(), [produtos]);
  const produtosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    return produtos.filter((produto) => {
      const active = !produto.status || produto.status === 'ativo';
      const matchesTerm = !term || [produto.nome, produto.categoria, produto.sku, produto.descricao]
        .some((value) => value?.toLowerCase().includes(term));
      return active && matchesTerm && (!category || produto.categoria === category);
    });
  }, [produtos, search, category]);

  const cartItems = useMemo(() => Object.entries(cart).flatMap(([id, quantidade]) => {
    const produto = produtos.find((item) => item.id === id);
    const precoUnitario = editingPrices[id] ?? Number(produto?.preco);
    return produto ? [{ produto, quantidade, precoUnitario, subtotal: precoUnitario * quantidade }] : [];
  }), [cart, editingPrices, produtos]);
  const quantidadeItens = cartItems.reduce((total, item) => total + item.quantidade, 0);
  const subtotal = cartItems.reduce((total, item) => total + item.subtotal, 0);
  const descontoNumero = Number(desconto.replace(',', '.')) || 0;
  const total = Math.max(0, subtotal - descontoNumero);
  const hoje = localDateKey(new Date());
  const vendasHoje = vendas.filter((venda) => localDateKey(venda.criadoEm) === hoje);
  const faturamentoHoje = vendasHoje.reduce((sum, venda) => sum + Number(venda.total), 0);

  function maxQuantityForSale(produto: Produto) {
    const quantidadeOriginal = editingVenda?.itens.find((item) => item.produtoId === produto.id)?.quantidade || 0;
    return availableStock(produto) + quantidadeOriginal;
  }

  function addProduct(produto: Produto) {
    const atual = cart[produto.id] || 0;
    const estoque = maxQuantityForSale(produto);
    if (atual >= estoque) {
      addToast('warning', `Não há mais unidades disponíveis de ${produto.nome}.`);
      return;
    }
    setCart((current) => ({ ...current, [produto.id]: atual + 1 }));
  }

  function changeQuantity(produto: Produto, next: number) {
    if (next <= 0) {
      setCart((current) => {
        const updated = { ...current };
        delete updated[produto.id];
        return updated;
      });
      return;
    }
    const estoque = maxQuantityForSale(produto);
    if (next > estoque) {
      addToast('warning', `Estoque disponível: ${estoque}.`);
      return;
    }
    setCart((current) => ({ ...current, [produto.id]: next }));
  }

  function startEditing(venda: Venda) {
    const produtosExistentes = new Set(produtos.map((produto) => produto.id));
    const itensDisponiveis = venda.itens.filter((item) => produtosExistentes.has(item.produtoId));
    if (itensDisponiveis.length !== venda.itens.length) {
      addToast('warning', 'Um produto antigo não existe mais. Ele foi removido da edição.');
    }
    if (!itensDisponiveis.length) {
      addToast('error', 'Nenhum produto desta venda está disponível para edição.');
      return;
    }
    setEditingVenda(venda);
    setCart(Object.fromEntries(itensDisponiveis.map((item) => [item.produtoId, item.quantidade])));
    setEditingPrices(Object.fromEntries(itensDisponiveis.map((item) => [item.produtoId, item.precoUnitario])));
    setClienteId(venda.clienteId || '');
    setMetodoPagamento(venda.metodoPagamento);
    setDesconto(String(venda.desconto || ''));
    setObservacao(venda.observacao || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEditing() {
    setEditingVenda(null);
    setEditingPrices({});
    setCart({});
    setClienteId('');
    setMetodoPagamento('pix');
    setDesconto('');
    setObservacao('');
  }

  async function finishSale(event: React.FormEvent) {
    event.preventDefault();
    if (!cartItems.length) {
      addToast('error', 'Adicione pelo menos um produto à venda.');
      return;
    }
    if (descontoNumero < 0 || descontoNumero > subtotal) {
      addToast('error', 'O desconto deve estar entre zero e o subtotal.');
      return;
    }

    const cliente = clientes.find((item) => item.id === clienteId);
    const vendaEmEdicao = editingVenda;
    setSaving(true);
    try {
      const vendaData = {
        itens: cartItems.map((item) => ({ produtoId: item.produto.id, quantidade: item.quantidade })),
        desconto: descontoNumero,
        metodoPagamento,
        clienteId: cliente?.id || null,
        clienteNome: cliente?.nome || null,
        observacao: observacao || null,
      };
      const venda = vendaEmEdicao
        ? await atualizarVenda(vendaEmEdicao.id, vendaData)
        : await registrarVenda(vendaData);
      if (vendaEmEdicao) {
        const quantidadeAnterior = new Map(vendaEmEdicao.itens.map((item) => [item.produtoId, item.quantidade]));
        const novaQuantidade = new Map(venda.itens.map((item) => [item.produtoId, item.quantidade]));
        setProdutos((current) => current.map((produto) => {
          const anterior = quantidadeAnterior.get(produto.id) || 0;
          const nova = novaQuantidade.get(produto.id) || 0;
          return anterior === nova
            ? produto
            : { ...produto, estoque: availableStock(produto) + anterior - nova };
        }));
        setVendas((current) => current.map((item) => item.id === venda.id ? venda : item));
      } else {
        const soldById = new Map(venda.itens.map((item) => [item.produtoId, item.quantidade]));
        setProdutos((current) => current.map((produto) => {
          const sold = soldById.get(produto.id);
          return sold ? { ...produto, estoque: availableStock(produto) - sold } : produto;
        }));
        setVendas((current) => [venda, ...current]);
      }
      setCart({});
      setEditingPrices({});
      setEditingVenda(null);
      setClienteId('');
      setMetodoPagamento('pix');
      setDesconto('');
      setObservacao('');
      addToast('success', vendaEmEdicao ? 'Venda atualizada e confirmada no Firebase.' : `Venda concluída: ${money.format(venda.total)}.`);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Não foi possível salvar a venda.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-page space-y-6">
      <header>
        <div className="mb-1 flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">Frente de caixa</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Selecione os produtos cadastrados, revise o pedido e finalize a venda.</p>
      </header>

      {editingVenda && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 sm:flex-row sm:items-center sm:justify-between dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <div className="flex items-start gap-3"><Pencil className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-bold">Editando venda de {dateTime.format(new Date(editingVenda.criadoEm))}</p><p className="text-xs opacity-80">Produtos e quantidades serão compensados automaticamente no estoque.</p></div></div>
          <button type="button" onClick={cancelEditing} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-bold text-amber-800 shadow-sm dark:bg-slate-900 dark:text-amber-200"><X className="h-4 w-4" />Cancelar edição</button>
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Produtos disponíveis</p>
          <p className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">{produtosFiltrados.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Vendas de hoje</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">{vendasHoje.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Faturamento de hoje</p>
          <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{money.format(faturamentoHoje)}</p>
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar produto, categoria, SKU..." className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100" />
            </label>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <option value="">Todas as categorias</option>
              {categorias.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center"><LoadingSpinner size="lg" /></div>
          ) : produtos.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
              <Package className="mb-3 h-10 w-10 text-slate-400" />
              <p className="font-bold text-slate-700 dark:text-slate-200">Nenhum produto cadastrado</p>
              <p className="mt-1 text-sm text-slate-500">Cadastre os produtos antes de iniciar uma venda.</p>
               <Link href="/Dashboard/Produtos" className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Cadastrar produtos</Link>
            </div>
          ) : produtosFiltrados.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-3xl border border-dashed border-slate-300 text-sm text-slate-500 dark:border-slate-700">Nenhum produto encontrado.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {produtosFiltrados.map((produto) => {
                const estoque = availableStock(produto);
                const unavailable = maxQuantityForSale(produto) <= 0;
                const link = produto.linkProduto;
                return (
                  <article key={produto.id} className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate font-bold text-slate-900 dark:text-slate-100">{produto.nome}</h2>
                        <p className="mt-0.5 truncate text-xs font-medium text-blue-600 dark:text-blue-400">{produto.categoria || 'Sem categoria'}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${unavailable ? 'bg-red-50 text-red-600 dark:bg-red-950/30' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'}`}>
                        {`${estoque} em estoque`}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 min-h-10 text-sm text-slate-500 dark:text-slate-400">{produto.descricao || 'Sem descrição informada.'}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                      {produto.sku && <span>SKU: {produto.sku}</span>}
                      {link?.startsWith('http') && <a href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400">Ver produto <ExternalLink className="h-3 w-3" /></a>}
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                      <div><p className="text-[10px] uppercase tracking-wider text-slate-400">Preço</p><p className="text-xl font-black text-slate-900 dark:text-slate-100">{money.format(Number(produto.preco) || 0)}</p></div>
                      <button type="button" onClick={() => addProduct(produto)} disabled={unavailable} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
                        <Plus className="h-4 w-4" /> Adicionar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <form onSubmit={finishSale} className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 xl:sticky xl:top-24">
          <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-700">
            <div className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-blue-600" /><h2 className="font-black text-slate-900 dark:text-slate-100">Pedido atual</h2></div>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{quantidadeItens} {quantidadeItens === 1 ? 'item' : 'itens'}</span>
          </div>

          <div className="max-h-72 space-y-3 overflow-y-auto p-5">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center text-slate-400"><ReceiptText className="mb-2 h-8 w-8" /><p className="text-sm">Adicione produtos ao pedido.</p></div>
            ) : cartItems.map(({ produto, quantidade, precoUnitario, subtotal: itemSubtotal }) => (
              <div key={produto.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">
                <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{produto.nome}</p><p className="text-xs text-slate-500">{money.format(precoUnitario)} cada</p></div><button type="button" onClick={() => changeQuantity(produto, 0)} className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`Remover ${produto.nome} do pedido`}><Trash2 className="h-4 w-4" /></button></div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                    <button type="button" onClick={() => changeQuantity(produto, quantidade - 1)} className="p-1.5 text-slate-500 hover:text-blue-600" aria-label={`Diminuir quantidade de ${produto.nome}`}><Minus className="h-3.5 w-3.5" /></button>
                    <span className="min-w-8 text-center text-sm font-bold text-slate-800 dark:text-slate-100">{quantidade}</span>
                    <button type="button" onClick={() => changeQuantity(produto, quantidade + 1)} className="p-1.5 text-slate-500 hover:text-blue-600" aria-label={`Aumentar quantidade de ${produto.nome}`}><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <p className="font-black text-slate-900 dark:text-slate-100">{money.format(itemSubtotal)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t border-slate-100 p-5 dark:border-slate-700">
            <label className="block"><span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400"><User className="h-3.5 w-3.5" />Cliente (opcional)</span><select value={clienteId} onChange={(event) => setClienteId(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"><option value="">Consumidor final</option>{clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>)}</select></label>
            <label className="block"><span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Forma de pagamento</span><select value={metodoPagamento} onChange={(event) => setMetodoPagamento(event.target.value as Venda['metodoPagamento'])} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">{Object.entries(paymentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="block"><span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Desconto (R$)</span><input value={desconto} onChange={(event) => setDesconto(event.target.value)} inputMode="decimal" placeholder="0,00" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" /></label>
            <label className="block"><span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Observação</span><textarea value={observacao} onChange={(event) => setObservacao(event.target.value)} rows={2} placeholder="Informações adicionais..." className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" /></label>

            <div className="space-y-1.5 border-t border-dashed border-slate-200 pt-3 text-sm dark:border-slate-700">
              <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{money.format(subtotal)}</span></div>
              <div className="flex justify-between text-slate-500"><span>Desconto</span><span>- {money.format(Math.min(descontoNumero, subtotal))}</span></div>
              <div className="flex items-end justify-between pt-1"><span className="font-bold text-slate-800 dark:text-slate-100">Total</span><span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{money.format(total)}</span></div>
            </div>

            <div className="flex gap-2">
              {editingVenda && <button type="button" onClick={cancelEditing} disabled={saving} className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">Cancelar</button>}
              <button type="submit" disabled={saving || cartItems.length === 0} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
                {saving ? <LoadingSpinner size="sm" /> : editingVenda ? <Pencil className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}{saving ? 'Salvando...' : editingVenda ? 'Salvar alterações' : 'Finalizar venda'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex items-center gap-2"><History className="h-5 w-5 text-blue-600" /><div><h2 className="font-black text-slate-900 dark:text-slate-100">Vendas recentes</h2><p className="text-xs text-slate-500">Últimos registros desta conta.</p></div></div>
        {loading ? <div className="flex h-24 items-center justify-center"><LoadingSpinner size="md" /></div> : vendas.length === 0 ? <div className="rounded-2xl bg-slate-50 py-10 text-center text-sm text-slate-500 dark:bg-slate-900/50">Nenhuma venda registrada ainda.</div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead><tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-700"><th className="px-3 py-3">Data</th><th className="px-3 py-3">Produtos</th><th className="px-3 py-3">Cliente</th><th className="px-3 py-3">Pagamento</th><th className="px-3 py-3 text-right">Total</th><th className="px-3 py-3 text-right">Ações</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700">{vendas.slice(0, 10).map((venda) => <tr key={venda.id} className="text-slate-700 dark:text-slate-300"><td className="whitespace-nowrap px-3 py-3">{dateTime.format(new Date(venda.criadoEm))}</td><td className="max-w-sm px-3 py-3"><p className="truncate font-medium">{venda.itens.map((item) => `${item.quantidade}× ${item.nome}`).join(', ')}</p><p className="text-xs text-slate-400">{venda.quantidadeItens} unidade(s)</p></td><td className="px-3 py-3">{venda.clienteNome || 'Consumidor final'}</td><td className="px-3 py-3"><span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium dark:bg-slate-700">{venda.metodoPagamento === 'dinheiro' ? <Banknote className="h-3 w-3" /> : venda.metodoPagamento === 'pix' ? <QrCode className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}{paymentLabels[venda.metodoPagamento]}</span></td><td className="px-3 py-3 text-right font-black text-emerald-600 dark:text-emerald-400">{money.format(venda.total)}</td><td className="px-3 py-3 text-right"><button type="button" onClick={() => startEditing(venda)} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50"><Pencil className="h-3.5 w-3.5" />Editar</button></td></tr>)}</tbody></table></div>
        )}
      </section>
    </div>
  );
}
