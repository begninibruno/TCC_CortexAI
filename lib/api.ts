import type { Produto, Categoria, Venda, Stats, VendasDia, EspStatus, Cliente, Cupom, Notificacao, PaginatedResult } from './types';

const BASE_URL = '';

// ═══════════════ Auth helper ─══════════════

function withToken(path: string, options?: RequestInit): RequestInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('cortexai_token') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return { ...options, headers };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, withToken(path, options));
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ═══════════════ Local storage helpers ═══════════════
const CATEGORIAS_KEY = 'cortexai_categorias';
const PRODUTOS_KEY = 'cortexai_produtos';

type StoredCategoria = Categoria & { id: number };
type StoredProduto = Produto & { id: number };

function readLocalStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[];
  } catch {
    return [];
  }
}

function writeLocalStorage<T>(key: string, value: T[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function getNextId(items: { id: number }[]): number {
  return items.length === 0 ? 1 : Math.max(...items.map((item) => item.id)) + 1;
}

function hasBackend(): boolean {
  return typeof window !== 'undefined' && Boolean(BASE_URL);
}

async function backendRequest<T>(path: string, options?: RequestInit): Promise<T> {
  return request<T>(path, options);
}

// ═══════════════ Produtos ═══════════════
export async function getProdutos(): Promise<Produto[]> {
  if (!hasBackend()) {
    return readLocalStorage<StoredProduto>(PRODUTOS_KEY) || [];
  }
  return backendRequest<Produto[]>('/api/produtos');
}

export async function getProdutosPaginado(page: number, limit: number, q?: string, categoria?: string, status?: string): Promise<PaginatedResult<Produto>> {
  if (!hasBackend()) {
    const all = readLocalStorage<StoredProduto>(PRODUTOS_KEY);
    let filtered = all;
    if (q) {
      const lower = q.toLowerCase();
      filtered = filtered.filter((produto) => produto.nome.toLowerCase().includes(lower) || (produto.sku || '').toLowerCase().includes(lower) || (produto.codigoBarras || '').toLowerCase().includes(lower) || (produto.categoria || '').toLowerCase().includes(lower));
    }
    if (categoria) {
      filtered = filtered.filter((produto) => produto.categoria === categoria);
    }
    if (status) {
      filtered = filtered.filter((produto) => (produto.status || 'ativo') === status);
    }
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const pageIndex = Math.max(1, Math.min(page, totalPages));
    const data = filtered.slice((pageIndex - 1) * limit, pageIndex * limit);
    return { data, total, page: pageIndex, totalPages, hasNext: pageIndex < totalPages, hasPrev: pageIndex > 1 };
  }
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) params.set('q', q);
  if (categoria) params.set('categoria', categoria);
  if (status) params.set('status', status);
  return backendRequest<PaginatedResult<Produto>>(`/api/produtos?${params}`);
}

export async function createProduto(data: Record<string, unknown>): Promise<Produto> {
  if (!hasBackend()) {
    const itens = readLocalStorage<StoredProduto>(PRODUTOS_KEY);
    const novo: StoredProduto = {
      id: getNextId(itens),
      nome: String(data.nome || ''),
      estoque: Number(data.estoque ?? 0),
      preco: Number(data.preco ?? 0),
      categoria: String(data.categoria || ''),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      sku: typeof data.sku === 'string' ? data.sku : null,
      codigoBarras: typeof data.codigoBarras === 'string' ? data.codigoBarras : null,
      precoCusto: data.precoCusto != null ? Number(data.precoCusto) : null,
      margemLucro: data.margemLucro != null ? Number(data.margemLucro) : null,
      estoqueMinimo: data.estoqueMinimo != null ? Number(data.estoqueMinimo) : null,
      fornecedor: typeof data.fornecedor === 'string' ? data.fornecedor : null,
      validade: typeof data.validade === 'string' ? data.validade : null,
      lote: typeof data.lote === 'string' ? data.lote : null,
      localizacao: typeof data.localizacao === 'string' ? data.localizacao : null,
      status: (data.status as Produto['status']) || 'ativo',
      tags: typeof data.tags === 'string' ? data.tags : null,
      descricao: typeof data.descricao === 'string' ? data.descricao : null,
    };
    writeLocalStorage(PRODUTOS_KEY, [...itens, novo]);
    return novo;
  }
  return backendRequest<Produto>('/api/produto', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateProduto(data: Record<string, unknown>) {
  if (!hasBackend()) {
    const itens = readLocalStorage<StoredProduto>(PRODUTOS_KEY);
    const updated = itens.map((produto) => {
      if (produto.id === Number(data.id) || produto.nome === data.nome) {
        return {
          ...produto,
          ...data,
          updatedAt: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
        };
      }
      return produto;
    });
    writeLocalStorage(PRODUTOS_KEY, updated);
    return;
  }
  return backendRequest('/api/produto', { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteProduto(nome: string): Promise<void> {
  if (!hasBackend()) {
    const itens = readLocalStorage<StoredProduto>(PRODUTOS_KEY);
    writeLocalStorage(PRODUTOS_KEY, itens.filter((produto) => produto.nome !== nome));
    return;
  }
  return backendRequest<void>('/api/produto', { method: 'DELETE', body: JSON.stringify({ nome }) });
}

// ═══════════════ Categorias ═══════════════
export async function getCategorias(): Promise<Categoria[]> {
  if (!hasBackend()) {
    return readLocalStorage<StoredCategoria>(CATEGORIAS_KEY) || [];
  }
  return backendRequest<Categoria[]>('/api/categorias');
}

export async function createCategoria(data: Record<string, unknown>): Promise<Categoria> {
  if (!hasBackend()) {
    const itens = readLocalStorage<StoredCategoria>(CATEGORIAS_KEY);
    const novo: StoredCategoria = {
      id: getNextId(itens),
      nome: String(data.nome || ''),
      criadoEm: new Date().toISOString(),
      descricao: typeof data.descricao === 'string' ? data.descricao : null,
      tipoProduto: typeof data.tipoProduto === 'string' ? (data.tipoProduto as Categoria['tipoProduto']) : null,
      classificacaoBebida: typeof data.classificacaoBebida === 'string' ? (data.classificacaoBebida as Categoria['classificacaoBebida']) : null,
      icone: typeof data.icone === 'string' ? data.icone : null,
      cor: typeof data.cor === 'string' ? data.cor : null,
      margemLucroPadrao: data.margemLucroPadrao != null ? Number(data.margemLucroPadrao) : null,
      metaVendasMensais: data.metaVendasMensais != null ? Number(data.metaVendasMensais) : null,
      comissaoPorVenda: data.comissaoPorVenda != null ? Number(data.comissaoPorVenda) : null,
      ordemExibicao: data.ordemExibicao != null ? Number(data.ordemExibicao) : null,
      status: (data.status as Categoria['status']) || 'ativa',
      tags: Array.isArray(data.tags) ? data.tags.join(', ') : typeof data.tags === 'string' ? data.tags : null,
    };
    writeLocalStorage(CATEGORIAS_KEY, [...itens, novo]);
    return novo;
  }
  return backendRequest<Categoria>('/api/categoria', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateCategoria(data: Record<string, unknown>) {
  if (!hasBackend()) {
    const itens = readLocalStorage<StoredCategoria>(CATEGORIAS_KEY);
    const updated = itens.map((categoria) => {
      if (categoria.id === Number(data.id) || categoria.nome === data.nome || categoria.nome === data.novoNome) {
        return {
          ...categoria,
          ...data,
          nome: typeof data.novoNome === 'string' ? data.novoNome : categoria.nome,
          atualizadoEm: new Date().toISOString(),
        };
      }
      return categoria;
    });
    writeLocalStorage(CATEGORIAS_KEY, updated);
    return;
  }
  return backendRequest('/api/categoria', { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteCategoria(nome: string): Promise<void> {
  if (!hasBackend()) {
    const itens = readLocalStorage<StoredCategoria>(CATEGORIAS_KEY);
    writeLocalStorage(CATEGORIAS_KEY, itens.filter((categoria) => categoria.nome !== nome));
    return;
  }
  return backendRequest<void>('/api/categoria', { method: 'DELETE', body: JSON.stringify({ nome }) });
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
  return request<Cliente[]>('/api/clientes');
}

export async function createCliente(data: Record<string, unknown>) {
  return request('/api/cliente', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateCliente(id: number, data: Record<string, unknown>) {
  return request('/api/cliente', { method: 'PUT', body: JSON.stringify({ id, ...data }) });
}

export async function deleteCliente(id: number): Promise<void> {
  return request<void>('/api/cliente', { method: 'DELETE', body: JSON.stringify({ id }) });
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
  return request('/api/relatorios/estoque-resumo');
}
