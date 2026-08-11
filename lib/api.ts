import type { Produto, Categoria, Venda, Stats, VendasDia, EspStatus, Cliente, Cupom, Notificacao, PaginatedResult } from './types';
import { auth, db } from '@/src/firebase';

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
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

function getUserUid(): string {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  return user.uid;
}

function removeUndefinedFields(data: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );
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
  const uid = getUserUid();

  const docRef = await addDoc(
    collection(db, 'empresas', uid, 'produtos'),
    {
      ...data,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    }
  );

  return {
    id: docRef.id,
    ...data,
  } as Produto;
}

export async function updateProduto(
  data: Record<string, unknown>
): Promise<void> {
  const uid = getUserUid();

  if (!data.id) {
    throw new Error('ID do produto não informado');
  }

  await updateDoc(
    doc(db, 'empresas', uid, 'produtos', String(data.id)),
    {
      ...data,
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
  const uid = getUserUid();
  const categoria = removeUndefinedFields(data);

  const docRef = await addDoc(
    collection(db, 'empresas', uid, 'categorias'),
    {
      ...categoria,
      criadoEm: new Date().toISOString(),
    }
  );

  return {
    id: docRef.id,
    ...categoria,
  } as Categoria;
}

export async function updateCategoria(
  data: Record<string, unknown>
): Promise<void> {
  const uid = getUserUid();

  if (!data.id) {
    throw new Error('ID da categoria não informado');
  }

  await updateDoc(
    doc(db, 'empresas', uid, 'categorias', String(data.id)),
    {
      ...removeUndefinedFields(data),
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
export interface VendaInput {
  produto: string;
  quantidade: number;
  preco: number;
  origem?: string;
  usuarioId?: number;
  clienteId?: number;
  desconto?: number;
  metodoPagamento?: string;
  troco?: number;
  cupomUsado?: string;
  audioLogId?: string;
}

export async function registrarVenda(data: VendaInput): Promise<Venda> {
  return request<Venda>('/api/venda', { method: 'POST', body: JSON.stringify(data) });
}

export async function getHistorico(): Promise<Venda[]> {
  return request<Venda[]>('/api/historico');
}

export async function getVendasPaginado(page: number, limit: number, filtros?: {
  dataInicio?: string; dataFim?: string; origem?: string; produto?: string;
}): Promise<PaginatedResult<Venda>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filtros?.dataInicio) params.set('dataInicio', filtros.dataInicio);
  if (filtros?.dataFim) params.set('dataFim', filtros.dataFim);
  if (filtros?.origem) params.set('origem', filtros.origem);
  if (filtros?.produto) params.set('produto', filtros.produto);
  return request<PaginatedResult<Venda>>(`/api/historico?${params}`);
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
