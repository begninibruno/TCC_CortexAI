import type { Produto, Categoria, Venda, Stats, VendasDia, EspStatus, Cliente, Cupom, Notificacao, PaginatedResult, Despesa } from './types';
import { auth, db } from '@/src/firebase';

import {
  collection,
  addDoc,
  getDocFromServer,
  getDocs,
  getDocsFromServer,
  updateDoc,
  deleteDoc,
  doc,
  runTransaction,
} from 'firebase/firestore';

const BASE_URL = '';

// ═══════════════ Auth helper ═══════════════

function withToken(options?: RequestInit): RequestInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('@CortexAI:token') : null;
  const headers = new Headers(options?.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return { ...options, headers };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, withToken(options));
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function getCurrentAccount(): { uid: string; email: string | null } {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('Sua sessão expirou. Entre novamente para continuar.');
  }

  return { uid: user.uid, email: user.email };
}

function getUserUid(): string {
  return getCurrentAccount().uid;
}

function removeUndefinedFields(data: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );
}

function normalizeQuantity(value: unknown): number {
  const quantity = Number(value);
  return Number.isFinite(quantity) ? Math.round(quantity * 1000) / 1000 : Number.NaN;
}

// ═══════════════ Produtos ═══════════════
export async function getProdutos(): Promise<Produto[]> {
  const uid = getUserUid();

  const snapshot = await getDocs(
    collection(db, 'empresas', uid, 'produtos')
  );

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Produto[];
}

export async function createProduto(
  data: Record<string, unknown>
): Promise<Produto> {
  const { uid, email } = getCurrentAccount();
  const produto = removeUndefinedFields(data);
  const now = new Date().toISOString();

  const docRef = await addDoc(
    collection(db, 'empresas', uid, 'produtos'),
    {
      ...produto,
      proprietarioUid: uid,
      proprietarioEmail: email,
      criadoEm: now,
      atualizadoEm: now,
    }
  );

  return {
    id: docRef.id,
    ...produto,
    proprietarioUid: uid,
    proprietarioEmail: email,
    criadoEm: now,
    atualizadoEm: now,
  } as Produto;
}

export async function updateProduto(
  data: Record<string, unknown>
): Promise<void> {
  const uid = getUserUid();

  if (!data.id) {
    throw new Error('ID do produto não informado');
  }

  const produto = { ...data };
  delete produto.id;
  await updateDoc(
    doc(db, 'empresas', uid, 'produtos', String(data.id)),
    {
      ...removeUndefinedFields(produto),
      atualizadoEm: new Date().toISOString(),
    }
  );
}

export async function deleteProduto(
  id: string
): Promise<void> {
  const uid = getUserUid();

  await deleteDoc(
    doc(db, 'empresas', uid, 'produtos', id)
  );
}

// ═══════════════ Categorias ═══════════════
export async function getCategorias(): Promise<Categoria[]> {
  const uid = getUserUid();

  const snapshot = await getDocs(
    collection(db, 'empresas', uid, 'categorias')
  );

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Categoria[];
}

export async function createCategoria(
  data: Record<string, unknown>
): Promise<Categoria> {
  const { uid, email } = getCurrentAccount();
  const categoria = removeUndefinedFields(data);
  const now = new Date().toISOString();

  const docRef = await addDoc(
    collection(db, 'empresas', uid, 'categorias'),
    {
      ...categoria,
      proprietarioUid: uid,
      proprietarioEmail: email,
      criadoEm: now,
      atualizadoEm: now,
    }
  );

  return {
    id: docRef.id,
    ...categoria,
    proprietarioUid: uid,
    proprietarioEmail: email,
    criadoEm: now,
    atualizadoEm: now,
  } as Categoria;
}

export async function updateCategoria(
  data: Record<string, unknown>
): Promise<void> {
  const uid = getUserUid();

  if (!data.id) {
    throw new Error('ID da categoria não informado');
  }

  const categoria = { ...data };
  delete categoria.id;
  await updateDoc(
    doc(db, 'empresas', uid, 'categorias', String(data.id)),
    {
      ...removeUndefinedFields(categoria),
      atualizadoEm: new Date().toISOString(),
    }
  );
}

export async function deleteCategoria(
  id: string
): Promise<void> {
  const uid = getUserUid();

  await deleteDoc(
    doc(db, 'empresas', uid, 'categorias', id)
  );
}

// ═══════════════ Vendas ═══════════════
export interface NovaVendaInput {
  itens: Array<{
    produtoId: string;
    quantidade: number;
  }>;
  desconto?: number;
  metodoPagamento: Venda['metodoPagamento'];
  clienteId?: string | null;
  clienteNome?: string | null;
  observacao?: string | null;
}

export async function registrarVenda(data: NovaVendaInput): Promise<Venda> {
  const { uid, email } = getCurrentAccount();
  if (!data.itens.length) throw new Error('Adicione pelo menos um produto à venda.');

  const itensAgrupados = Array.from(
    data.itens.reduce((map, item) => {
      const quantidade = normalizeQuantity(item.quantidade);
      if (!item.produtoId || !Number.isFinite(quantidade) || quantidade <= 0) {
        throw new Error('A venda possui uma quantidade inválida.');
      }
      map.set(item.produtoId, normalizeQuantity((map.get(item.produtoId) || 0) + quantidade));
      return map;
    }, new Map<string, number>())
  ).map(([produtoId, quantidade]) => ({ produtoId, quantidade }));

  const desconto = Number(data.desconto) || 0;
  if (desconto < 0) throw new Error('O desconto não pode ser negativo.');

  return runTransaction(db, async (transaction) => {
    const produtoRefs = itensAgrupados.map((item) => doc(db, 'empresas', uid, 'produtos', item.produtoId));
    const snapshots = await Promise.all(produtoRefs.map((ref) => transaction.get(ref)));
    const now = new Date().toISOString();

    const itens = snapshots.map((snapshot, index) => {
      if (!snapshot.exists()) throw new Error('Um dos produtos selecionados não existe mais.');
      const produto = snapshot.data() as Partial<Produto>;
      const quantidade = itensAgrupados[index].quantidade;
      const precoUnitario = Number(produto.preco);
      if (!Number.isFinite(precoUnitario) || precoUnitario < 0) {
        throw new Error(`O produto ${produto.nome || ''} possui preço inválido.`);
      }

      const estoqueAtual = Number(produto.estoque);
      if (!Number.isFinite(estoqueAtual) || estoqueAtual < 0) {
        throw new Error(`Configure o estoque de ${produto.nome || 'um produto selecionado'} antes de vender.`);
      }
      if (estoqueAtual < quantidade) {
        throw new Error(`Estoque insuficiente para ${produto.nome || 'o produto selecionado'}.`);
      }

      transaction.update(produtoRefs[index], {
        estoque: normalizeQuantity(estoqueAtual - quantidade),
        atualizadoEm: now,
      });

      return {
        produtoId: snapshot.id,
        nome: produto.nome || 'Produto',
        categoria: produto.categoria || 'Sem categoria',
        quantidade,
        precoUnitario,
        subtotal: precoUnitario * quantidade,
        unidadeMedida: produto.unidadeMedida || 'unidade',
      };
    });

    const subtotal = itens.reduce((total, item) => total + item.subtotal, 0);
    if (desconto > subtotal) throw new Error('O desconto não pode ser maior que o subtotal.');
    const vendaRef = doc(collection(db, 'empresas', uid, 'vendas'));
    const venda: Venda = {
      id: vendaRef.id,
      itens,
      quantidadeItens: itens.reduce((total, item) => total + item.quantidade, 0),
      subtotal,
      desconto,
      total: subtotal - desconto,
      metodoPagamento: data.metodoPagamento,
      clienteId: data.clienteId || null,
      clienteNome: data.clienteNome?.trim() || null,
      observacao: data.observacao?.trim() || null,
      status: 'concluida',
      proprietarioUid: uid,
      proprietarioEmail: email,
      criadoEm: now,
      atualizadoEm: now,
    };
    const vendaPersistida: Partial<Venda> = { ...venda };
    delete vendaPersistida.id;
    transaction.set(vendaRef, vendaPersistida);
    return venda;
  });
}

export async function atualizarVenda(vendaId: string, data: NovaVendaInput): Promise<Venda> {
  const { uid, email } = getCurrentAccount();
  if (!vendaId) throw new Error('Venda não informada.');
  if (!data.itens.length) throw new Error('A venda precisa ter pelo menos um produto.');

  const novosItens = Array.from(
    data.itens.reduce((map, item) => {
      const quantidade = normalizeQuantity(item.quantidade);
      if (!item.produtoId || !Number.isFinite(quantidade) || quantidade <= 0) {
        throw new Error('A venda possui uma quantidade inválida.');
      }
      map.set(item.produtoId, normalizeQuantity((map.get(item.produtoId) || 0) + quantidade));
      return map;
    }, new Map<string, number>())
  ).map(([produtoId, quantidade]) => ({ produtoId, quantidade }));

  const desconto = Number(data.desconto) || 0;
  if (desconto < 0) throw new Error('O desconto não pode ser negativo.');

  const vendaAtualizada = await runTransaction(db, async (transaction) => {
    const vendaRef = doc(db, 'empresas', uid, 'vendas', vendaId);
    const vendaSnapshot = await transaction.get(vendaRef);
    if (!vendaSnapshot.exists()) throw new Error('Esta venda não existe mais.');
    const vendaAnterior = { id: vendaSnapshot.id, ...vendaSnapshot.data() } as Venda;
    if (!Array.isArray(vendaAnterior.itens) || vendaAnterior.status !== 'concluida') {
      throw new Error('Esta venda não pode ser editada.');
    }

    const quantidadesAnteriores = new Map(vendaAnterior.itens.map((item) => [item.produtoId, item.quantidade]));
    const novasQuantidades = new Map(novosItens.map((item) => [item.produtoId, item.quantidade]));
    const produtoIds = Array.from(new Set([...quantidadesAnteriores.keys(), ...novasQuantidades.keys()]));
    const produtoRefs = new Map(produtoIds.map((id) => [id, doc(db, 'empresas', uid, 'produtos', id)]));
    const produtoSnapshots = await Promise.all(produtoIds.map((id) => transaction.get(produtoRefs.get(id)!)));
    const produtosPorId = new Map(produtoSnapshots.map((snapshot) => [snapshot.id, snapshot]));
    const now = new Date().toISOString();

    for (const produtoId of produtoIds) {
      const snapshot = produtosPorId.get(produtoId)!;
      const quantidadeAnterior = Number(quantidadesAnteriores.get(produtoId)) || 0;
      const novaQuantidade = Number(novasQuantidades.get(produtoId)) || 0;
      if (!snapshot.exists()) {
        if (novaQuantidade > 0) throw new Error('Um produto desta venda não existe mais e precisa ser removido.');
        continue;
      }
      const produto = snapshot.data() as Partial<Produto>;
      const estoqueInformado = produto.estoque as unknown;
      const produtoLegadoSemEstoque = estoqueInformado === undefined || estoqueInformado === null || estoqueInformado === '';
      const estoqueAtual = produtoLegadoSemEstoque ? 0 : Number(estoqueInformado);
      if (!Number.isFinite(estoqueAtual) || estoqueAtual < 0) {
        throw new Error(`Configure o estoque de ${produto.nome || 'um produto selecionado'} antes de editar.`);
      }
      const estoqueFinal = normalizeQuantity(estoqueAtual + quantidadeAnterior - novaQuantidade);
      if (estoqueFinal < 0) {
        throw new Error(`Estoque insuficiente para aumentar a quantidade de ${produto.nome || 'um produto selecionado'}.`);
      }
      transaction.update(produtoRefs.get(produtoId)!, { estoque: estoqueFinal, atualizadoEm: now });
    }

    const itens = novosItens.map(({ produtoId, quantidade }) => {
      const snapshot = produtosPorId.get(produtoId)!;
      if (!snapshot.exists()) throw new Error('Um produto selecionado não existe mais.');
      const produto = snapshot.data() as Partial<Produto>;
      const itemAnterior = vendaAnterior.itens.find((item) => item.produtoId === produtoId);
      const precoUnitario = itemAnterior?.precoUnitario ?? Number(produto.preco);
      if (!Number.isFinite(precoUnitario) || precoUnitario < 0) {
        throw new Error(`O produto ${produto.nome || ''} possui preço inválido.`);
      }
      return {
        produtoId,
        nome: produto.nome || itemAnterior?.nome || 'Produto',
        categoria: produto.categoria || itemAnterior?.categoria || 'Sem categoria',
        quantidade,
        precoUnitario,
        subtotal: precoUnitario * quantidade,
        unidadeMedida: produto.unidadeMedida || itemAnterior?.unidadeMedida || 'unidade',
      };
    });

    const subtotal = itens.reduce((total, item) => total + item.subtotal, 0);
    if (desconto > subtotal) throw new Error('O desconto não pode ser maior que o subtotal.');
    const vendaAtualizada: Venda = {
      ...vendaAnterior,
      itens,
      quantidadeItens: itens.reduce((total, item) => total + item.quantidade, 0),
      subtotal,
      desconto,
      total: subtotal - desconto,
      metodoPagamento: data.metodoPagamento,
      clienteId: data.clienteId || null,
      clienteNome: data.clienteNome?.trim() || null,
      observacao: data.observacao?.trim() || null,
      proprietarioUid: uid,
      proprietarioEmail: email,
      atualizadoEm: now,
    };
    const vendaPersistida: Partial<Venda> = { ...vendaAtualizada };
    delete vendaPersistida.id;
    transaction.update(vendaRef, vendaPersistida);
    return vendaAtualizada;
  });

  // Só informa sucesso depois de confirmar que a nova versão chegou ao servidor.
  // Isso também evita que a tela volte a exibir uma cópia antiga do cache local.
  const vendaConfirmada = await getDocFromServer(doc(db, 'empresas', uid, 'vendas', vendaId));
  if (!vendaConfirmada.exists()) throw new Error('Não foi possível confirmar a venda atualizada no Firebase.');
  const dadosConfirmados = vendaConfirmada.data();
  if (dadosConfirmados.atualizadoEm !== vendaAtualizada.atualizadoEm) {
    throw new Error('A alteração não foi confirmada pelo Firebase. Tente salvar novamente.');
  }
  return { id: vendaConfirmada.id, ...dadosConfirmados } as Venda;
}

export async function getHistorico(): Promise<Venda[]> {
  const uid = getUserUid();
  const snapshot = await getDocsFromServer(collection(db, 'empresas', uid, 'vendas'));
  return snapshot.docs
    .flatMap((item) => {
      const data = item.data();
      return Array.isArray(data.itens) && typeof data.criadoEm === 'string'
        ? [{ id: item.id, ...data } as Venda]
        : [];
    })
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

export async function getVendasPaginado(page: number, limit: number, filtros?: {
  dataInicio?: string; dataFim?: string; produto?: string;
}): Promise<PaginatedResult<Venda>> {
  const historico = await getHistorico();
  const filtrado = historico.filter((venda) => {
    const dataVenda = venda.criadoEm.slice(0, 10);
    return (!filtros?.dataInicio || dataVenda >= filtros.dataInicio)
      && (!filtros?.dataFim || dataVenda <= filtros.dataFim)
      && (!filtros?.produto || venda.itens.some((item) => item.nome.toLowerCase().includes(filtros.produto!.toLowerCase())));
  });
  const safeLimit = Math.max(1, limit);
  const totalPages = Math.max(1, Math.ceil(filtrado.length / safeLimit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    data: filtrado.slice((safePage - 1) * safeLimit, safePage * safeLimit),
    total: filtrado.length,
    page: safePage,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  };
}

// ═══════════════ Despesas ═══════════════
export async function getDespesas(): Promise<Despesa[]> {
  const uid = getUserUid();
  const snapshot = await getDocs(collection(db, 'empresas', uid, 'despesas'));
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }) as Despesa)
    .sort((a, b) => b.data.localeCompare(a.data));
}

export async function createDespesa(data: Omit<Despesa, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<Despesa> {
  const uid = getUserUid();
  const now = new Date().toISOString();
  const payload = removeUndefinedFields({ ...data, valor: Number(data.valor), criadoEm: now, atualizadoEm: now });
  const reference = await addDoc(collection(db, 'empresas', uid, 'despesas'), payload);
  return { id: reference.id, ...data, valor: Number(data.valor), criadoEm: now, atualizadoEm: now };
}

export async function deleteDespesa(id: string): Promise<void> {
  const uid = getUserUid();
  await deleteDoc(doc(db, 'empresas', uid, 'despesas', id));
}

// ═══════════════ Stats & Charts ═══════════════
export async function getStats(): Promise<Stats> {
  return request<Stats>('/api/stats');
}

export async function getVendas7Dias(): Promise<VendasDia[]> {
  return request<VendasDia[]>('/api/vendas-7dias');
}

export async function getFaturamentoDia(): Promise<{ valor: number }> {
  return request<{ valor: number }>('/api/faturamento-dia');
}

// ═══════════════ Relatórios ═══════════════
export async function getRelatorioFaturamento(periodo: string, inicio?: string, fim?: string) {
  const params: Record<string, string> = { periodo };
  if (inicio) params.inicio = inicio;
  if (fim) params.fim = fim;
  const qs = new URLSearchParams(params).toString();
  return request(`/api/relatorios/faturamento?${qs}`);
}

export async function getRelatorioTopProdutos(limit?: number) {
  return request(`/api/relatorios/top-produtos?limit=${limit || 10}`);
}

export async function getRelatorioVendasPorDia(inicio: string, fim: string) {
  return request(`/api/relatorios/vendas-por-dia?inicio=${inicio}&fim=${fim}`);
}

// ═══════════════ Clientes ═══════════════
export async function getClientes(): Promise<Cliente[]> {
  const uid = getUserUid();
  const snapshot = await getDocs(collection(db, 'empresas', uid, 'clientes'));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Cliente[];
}

export async function createCliente(data: Omit<Cliente, 'id' | 'criadoEm'>) {
  const uid = getUserUid();
  const docRef = await addDoc(collection(db, 'empresas', uid, 'clientes'), {
    ...removeUndefinedFields(data),
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  });
  return { id: docRef.id, ...data, criadoEm: new Date().toISOString() } as Cliente;
}

export async function updateCliente(id: string, data: Omit<Cliente, 'id' | 'criadoEm'>) {
  const uid = getUserUid();
  await updateDoc(doc(db, 'empresas', uid, 'clientes', id), {
      ...removeUndefinedFields(data),
    atualizadoEm: new Date().toISOString(),
  });
}

export async function deleteCliente(id: string): Promise<void> {
  const uid = getUserUid();
  await deleteDoc(doc(db, 'empresas', uid, 'clientes', id));
}

// ═══════════════ Cupons ═══════════════
export async function getCupons(): Promise<Cupom[]> {
  return request<Cupom[]>('/api/cupons');
}

export async function createCupom(data: Record<string, unknown>) {
  return request('/api/cupom', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateCupom(id: number, data: Record<string, unknown>) {
  return request('/api/cupom', { method: 'PUT', body: JSON.stringify({ id, ...data }) });
}

export async function deleteCupom(codigo: string): Promise<void> {
  return request<void>('/api/cupom', { method: 'DELETE', body: JSON.stringify({ codigo }) });
}

export async function validarCupom(codigo: string) {
  return request(`/api/cupons/${codigo}/validar`, { method: 'POST' });
}

// ═══════════════ Notificações ═══════════════
export async function getNotificacoes(naoLidasOnly = false): Promise<Notificacao[]> {
  const lida = naoLidasOnly ? 'false' : undefined;
  const qs = lida ? `?lida=${lida}` : '';
  const result = await request<{ data: Notificacao[] }>(`/api/notificacoes${qs}`);
  return result.data;
}

export async function marcarNaoLidasCount(): Promise<number> {
  const result = await request<{ count: number }>('/api/notificacoes/nao-lidas/count');
  return result.count;
}

export async function marcarNotificacaoLida(id: number): Promise<void> {
  return request<void>(`/api/notificacao/${id}/lida`, { method: 'PUT' });
}

export async function marcarTodasLidas(): Promise<void> {
  return request<void>('/api/notificacoes/lidas', { method: 'PUT' });
}

// ═══════════════ AI ═══════════════
type AIResponse = {
  itens: Array<{
    nome: string;
    quantidade?: number;
  }>;
};

export async function processarTexto(texto: string): Promise<AIResponse> {
  return request<AIResponse>('/api/processar-texto', {
    method: 'POST',
    body: JSON.stringify({ texto })
  });
}

// ═══════════════ ESP32 ═══════════════
export async function getEspStatus(): Promise<EspStatus> {
  return request<EspStatus>('/api/esp-status');
}

// ═══════════════ Estoque ═══════════════
export async function getEstoqueBaixo(): Promise<{ produtos: Array<{ id: number; nome: string; estoque: number; limite: number; diferenca: number }>; total: number }> {
  return request('/api/relatorios/estoque-baixo');
}

export async function getEstoqueResumo(): Promise<{ totalItens: number; valorTotalCusto: number; produtosCadastrados: number; semEstoque: number }> {
  const produtos = await getProdutos();
  return produtos.reduce(
    (resumo, produto) => {
      const estoque = Number(produto.estoque) || 0;
      const custo = Number(produto.precoCusto ?? produto.preco) || 0;
      resumo.totalItens += estoque;
      resumo.valorTotalCusto += estoque * custo;
      resumo.produtosCadastrados += 1;
      if (estoque <= 0) resumo.semEstoque += 1;
      return resumo;
    },
    { totalItens: 0, valorTotalCusto: 0, produtosCadastrados: 0, semEstoque: 0 }
  );
}
