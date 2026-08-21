export type UnidadeMedida = 'unidade' | 'kg' | 'litro' | 'kit';

export interface Produto {
  id: string;
  nome: string;
  estoque: number;
  preco: number;
  categoria: string;
  categoriaId?: string | null;
  linkProduto?: string | null;
  criadoEm: string;
  atualizadoEm: string;
  proprietarioUid?: string;
  proprietarioEmail?: string | null;
  sku?: string | null;
  codigoBarras?: string | null;
  precoCusto?: number | null;
  margemLucro?: number | null;
  estoqueMinimo?: number | null;
  fornecedor?: string | null;
  validade?: string | null;
  lote?: string | null;
  localizacao?: string | null;
  status?: 'ativo' | 'inativo' | 'descontinuado';
  tags?: string | string[] | null;
  descricao?: string | null;
  unidadeMedida?: UnidadeMedida;
}

export interface Categoria {
  id: string;
  nome: string;
  criadoEm: string;
  atualizadoEm?: string;
  proprietarioUid?: string;
  proprietarioEmail?: string | null;
  descricao?: string | null;
  tipoProduto?: 'bebida' | 'comida' | 'eletronico' | 'outro' | null;
  classificacaoBebida?: 'normal' | 'alcoolica' | 'refrigerada' | null;
  icone?: string | null;
  cor?: string | null;
  margemLucroPadrao?: number | null;
  metaVendasMensais?: number | null;
  comissaoPorVenda?: number | null;
  ordemExibicao?: number | null;
  status?: 'ativa' | 'inativa';
  tags?: string | string[] | null;
}

export interface ItemVenda {
  produtoId: string;
  nome: string;
  categoria: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  unidadeMedida?: UnidadeMedida;
}

export interface Venda {
  id: string;
  itens: ItemVenda[];
  quantidadeItens: number;
  subtotal: number;
  desconto: number;
  total: number;
  metodoPagamento: 'dinheiro' | 'pix' | 'credito' | 'debito' | 'outro';
  clienteId?: string | null;
  clienteNome?: string | null;
  observacao?: string | null;
  status: 'concluida' | 'cancelada';
  proprietarioUid: string;
  proprietarioEmail?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Stats {
  totalVendas: number;
  faturamentoTotal: number;
  ticketMedio: number;
  produtosUnicos: number;
  valorEstoque: number;
}

export interface VendasDia {
  label: string;
  date: string;
  total: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export interface EspStatus {
  online: boolean;
  ultimoHeartbeat: number | null;
}

export interface Cliente {
  id: string;
  nome: string;
  cpf?: string | null;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  obs?: string | null;
  ativo: boolean;
  criadoEm: string;
}

export interface Cupom {
  id: number;
  codigo: string;
  tipo: 'percentual' | 'valor';
  valor: number;
  valorMinimo?: number | null;
  validoAte: string;
  usosMax: number;
  usos: number;
  ativo: boolean;
  criadoEm: string;
}

export interface Notificacao {
  id: number;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criadoEm: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Despesa {
  id: string;
  descricao: string;
  categoria: 'aluguel' | 'energia' | 'agua' | 'internet' | 'fornecedores' | 'salarios' | 'impostos' | 'marketing' | 'manutencao' | 'transporte' | 'outros';
  valor: number;
  data: string;
  formaPagamento?: 'dinheiro' | 'pix' | 'credito' | 'debito' | 'boleto' | 'transferencia' | 'outro';
  recorrente?: boolean;
  observacao?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}
