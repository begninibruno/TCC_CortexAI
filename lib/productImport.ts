import type { Produto, UnidadeMedida } from './types';

export type ImportField =
  | 'nome'
  | 'descricao'
  | 'preco'
  | 'precoCusto'
  | 'estoque'
  | 'estoqueMinimo'
  | 'unidadeMedida'
  | 'categoria'
  | 'sku'
  | 'codigoBarras'
  | 'fornecedor'
  | 'validade'
  | 'lote'
  | 'localizacao'
  | 'linkProduto'
  | 'status'
  | 'tags';

export type SpreadsheetCell = string | number | boolean | Date | null;
export type ColumnMapping = Record<number, ImportField | 'ignore'>;

export interface ParsedSpreadsheet {
  fileName: string;
  headers: string[];
  rows: SpreadsheetCell[][];
  mapping: ColumnMapping;
  headerRow: number;
}

export interface PreparedImportRow {
  sourceRow: number;
  data: Omit<Produto, 'id' | 'criadoEm' | 'atualizadoEm'> & {
    dadosImportados?: Record<string, string | number | boolean | null>;
  };
  errors: string[];
  warnings: string[];
}

export const IMPORT_FIELDS: Array<{ key: ImportField; label: string }> = [
  { key: 'nome', label: 'Nome do produto' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'preco', label: 'Preço de venda' },
  { key: 'precoCusto', label: 'Preço de custo' },
  { key: 'estoque', label: 'Estoque atual' },
  { key: 'estoqueMinimo', label: 'Estoque mínimo' },
  { key: 'unidadeMedida', label: 'Unidade de medida' },
  { key: 'categoria', label: 'Categoria' },
  { key: 'sku', label: 'SKU / código interno' },
  { key: 'codigoBarras', label: 'Código de barras / EAN' },
  { key: 'fornecedor', label: 'Fornecedor' },
  { key: 'validade', label: 'Validade' },
  { key: 'lote', label: 'Lote / série' },
  { key: 'localizacao', label: 'Localização' },
  { key: 'linkProduto', label: 'Link do produto' },
  { key: 'status', label: 'Status' },
  { key: 'tags', label: 'Tags' },
];

const ALIASES: Record<ImportField, string[]> = {
  nome: ['nome', 'produto', 'nome produto', 'descricao produto', 'item', 'mercadoria', 'title'],
  descricao: ['descricao', 'detalhes', 'observacao', 'observacoes', 'complemento'],
  preco: ['preco', 'preco venda', 'valor venda', 'valor', 'preco unitario', 'venda', 'price', 'sale price'],
  precoCusto: ['preco custo', 'custo', 'valor custo', 'custo unitario', 'cost'],
  estoque: ['estoque', 'saldo', 'quantidade', 'qtd', 'estoque atual', 'saldo estoque', 'stock'],
  estoqueMinimo: ['estoque minimo', 'minimo', 'qtd minima', 'quantidade minima', 'minimum stock'],
  unidadeMedida: ['unidade', 'unidade medida', 'und', 'un', 'medida', 'unit'],
  categoria: ['categoria', 'grupo', 'departamento', 'secao', 'tipo', 'category'],
  sku: ['sku', 'codigo', 'codigo produto', 'cod produto', 'referencia', 'ref', 'codigo interno'],
  codigoBarras: ['codigo barras', 'codigo de barras', 'ean', 'ean13', 'gtin', 'barcode'],
  fornecedor: ['fornecedor', 'marca', 'fabricante', 'supplier'],
  validade: ['validade', 'data validade', 'vencimento', 'expiration'],
  lote: ['lote', 'serie', 'numero lote', 'batch'],
  localizacao: ['localizacao', 'prateleira', 'corredor', 'endereco estoque', 'location'],
  linkProduto: ['link', 'url', 'site', 'link produto', 'url produto'],
  status: ['status', 'situacao', 'ativo', 'active'],
  tags: ['tags', 'etiquetas', 'palavras chave', 'marcadores'],
};

export function normalizeText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_\-./\\]+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferField(header: string): ImportField | 'ignore' {
  const normalized = normalizeText(header);
  if (!normalized) return 'ignore';

  let best: { field: ImportField; score: number } | null = null;
  for (const field of IMPORT_FIELDS) {
    for (const alias of ALIASES[field.key]) {
      const normalizedAlias = normalizeText(alias);
      const score = normalized === normalizedAlias ? 100 : normalized.includes(normalizedAlias) ? normalizedAlias.length : 0;
      if (score && (!best || score > best.score)) best = { field: field.key, score };
    }
  }
  return best?.field ?? 'ignore';
}

function detectHeaderRow(rows: SpreadsheetCell[][]): number {
  let bestIndex = 0;
  let bestScore = -1;
  rows.slice(0, 15).forEach((row, index) => {
    const inferred = new Set(row.map((cell) => inferField(String(cell ?? ''))).filter((field) => field !== 'ignore'));
    const nonEmpty = row.filter((cell) => String(cell ?? '').trim()).length;
    const score = inferred.size * 10 + Math.min(nonEmpty, 9);
    if (score > bestScore) {
      bestIndex = index;
      bestScore = score;
    }
  });
  return bestIndex;
}

function uniqueHeaders(row: SpreadsheetCell[]): string[] {
  const occurrences = new Map<string, number>();
  return row.map((cell, index) => {
    const base = String(cell ?? '').trim() || `Coluna ${index + 1}`;
    const count = (occurrences.get(base) ?? 0) + 1;
    occurrences.set(base, count);
    return count === 1 ? base : `${base} (${count})`;
  });
}

function buildMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const used = new Set<ImportField>();
  headers.forEach((header, index) => {
    const field = inferField(header);
    mapping[index] = field !== 'ignore' && !used.has(field) ? field : 'ignore';
    if (field !== 'ignore') used.add(field);
  });
  return mapping;
}

function detectDelimiter(text: string): string {
  const sample = text.split(/\r?\n/).slice(0, 8).join('\n');
  const candidates = [',', ';', '\t'];
  return candidates.reduce((best, delimiter) => {
    const count = sample.split(delimiter).length;
    return count > best.count ? { delimiter, count } : best;
  }, { delimiter: ',', count: 0 }).delimiter;
}

function parseCsv(text: string): SpreadsheetCell[][] {
  const delimiter = detectDelimiter(text);
  const rows: SpreadsheetCell[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (character === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      row.push(value.trim());
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1;
      row.push(value.trim());
      if (row.some((cell) => cell !== '')) rows.push(row);
      row = [];
      value = '';
    } else {
      value += character;
    }
  }
  row.push(value.trim());
  if (row.some((cell) => cell !== '')) rows.push(row);
  return rows;
}

export async function parseProductFile(file: File): Promise<ParsedSpreadsheet> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  let rawRows: SpreadsheetCell[][];

  if (extension === 'csv') {
    rawRows = parseCsv((await file.text()).replace(/^\uFEFF/, ''));
  } else if (extension === 'xlsx') {
    const { readSheet } = await import('read-excel-file/browser');
    rawRows = (await readSheet(file)) as SpreadsheetCell[][];
  } else {
    throw new Error('Formato não aceito. Selecione um arquivo .xlsx ou .csv.');
  }

  if (!rawRows.length) throw new Error('A planilha está vazia.');
  if (rawRows.length > 10001) throw new Error('A planilha pode ter no máximo 10.000 produtos por importação.');

  const headerRow = detectHeaderRow(rawRows);
  const headers = uniqueHeaders(rawRows[headerRow]);
  const rows = rawRows
    .slice(headerRow + 1)
    .filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''));

  if (!rows.length) throw new Error('Não foram encontradas linhas de produtos abaixo do cabeçalho.');
  return { fileName: file.name, headers, rows, mapping: buildMapping(headers), headerRow };
}

function parseNumber(value: SpreadsheetCell, kind: 'money' | 'quantity'): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  let text = String(value ?? '').trim();
  if (!text) return null;
  text = text.replace(/[^0-9,.-]/g, '');
  const comma = text.lastIndexOf(',');
  const dot = text.lastIndexOf('.');
  if (comma >= 0 && dot >= 0) {
    text = comma > dot ? text.replace(/\./g, '').replace(',', '.') : text.replace(/,/g, '');
  } else if (comma >= 0) {
    text = text.replace(/\./g, '').replace(',', '.');
  } else if ((text.match(/\./g) ?? []).length > 1) {
    const pieces = text.split('.');
    const decimal = pieces.at(-1)?.length === (kind === 'money' ? 2 : -1);
    text = decimal ? `${pieces.slice(0, -1).join('')}.${pieces.at(-1)}` : pieces.join('');
  }
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseUnit(value: SpreadsheetCell): UnidadeMedida {
  const normalized = normalizeText(value);
  if (['kg', 'quilo', 'quilos', 'quilograma', 'quilogramas'].includes(normalized)) return 'kg';
  if (['l', 'lt', 'litro', 'litros'].includes(normalized)) return 'litro';
  if (['kit', 'conjunto', 'combo', 'pack'].includes(normalized)) return 'kit';
  return 'unidade';
}

function parseStatus(value: SpreadsheetCell): Produto['status'] {
  const normalized = normalizeText(value);
  if (['inativo', 'inativa', 'nao', 'false', '0', 'bloqueado'].includes(normalized)) return 'inativo';
  if (['descontinuado', 'descontinuada', 'fora de linha'].includes(normalized)) return 'descontinuado';
  return 'ativo';
}

function parseDate(value: SpreadsheetCell): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  const text = String(value ?? '').trim();
  if (!text) return undefined;
  const br = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (br) return `${br[3]}-${br[2].padStart(2, '0')}-${br[1].padStart(2, '0')}`;
  const iso = text.match(/^\d{4}-\d{2}-\d{2}/);
  return iso ? iso[0] : text;
}

function cellText(value: SpreadsheetCell): string {
  if (value instanceof Date) return value.toISOString();
  return String(value ?? '').trim();
}

export function prepareProductRows(parsed: ParsedSpreadsheet, mapping: ColumnMapping): PreparedImportRow[] {
  return parsed.rows.map((row, rowIndex) => {
    const values = new Map<ImportField, SpreadsheetCell>();
    const extra: Record<string, string | number | boolean | null> = {};
    parsed.headers.forEach((header, columnIndex) => {
      const value = row[columnIndex] ?? null;
      const field = mapping[columnIndex] ?? 'ignore';
      if (field === 'ignore') {
        if (cellText(value)) extra[header] = value instanceof Date ? value.toISOString() : value;
      } else {
        values.set(field, value);
      }
    });

    const errors: string[] = [];
    const warnings: string[] = [];
    const nome = cellText(values.get('nome') ?? null);
    if (!nome) errors.push('Nome não informado');

    const precoValue = values.get('preco');
    const preco = parseNumber(precoValue ?? null, 'money');
    if (precoValue != null && cellText(precoValue) && (preco == null || preco < 0)) errors.push('Preço inválido');
    if (preco == null) warnings.push('Preço definido como R$ 0,00');

    const estoqueValue = values.get('estoque');
    const estoque = parseNumber(estoqueValue ?? null, 'quantity');
    if (estoqueValue != null && cellText(estoqueValue) && (estoque == null || estoque < 0)) errors.push('Estoque inválido');
    if (estoque == null) warnings.push('Estoque definido como zero');

    const precoCusto = parseNumber(values.get('precoCusto') ?? null, 'money');
    if (values.has('precoCusto') && cellText(values.get('precoCusto') ?? null) && (precoCusto == null || precoCusto < 0)) errors.push('Preço de custo inválido');
    const estoqueMinimo = parseNumber(values.get('estoqueMinimo') ?? null, 'quantity');
    if (values.has('estoqueMinimo') && cellText(values.get('estoqueMinimo') ?? null) && (estoqueMinimo == null || estoqueMinimo < 0)) errors.push('Estoque mínimo inválido');

    const categoria = cellText(values.get('categoria') ?? null) || 'Sem categoria';
    if (categoria === 'Sem categoria') warnings.push('Categoria definida como “Sem categoria”');

    const linkProduto = cellText(values.get('linkProduto') ?? null) || undefined;
    if (linkProduto) {
      try {
        const url = new URL(linkProduto);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
      } catch {
        errors.push('Link inválido');
      }
    }

    const finalPrice = preco ?? 0;
    const data: PreparedImportRow['data'] = {
      nome,
      descricao: cellText(values.get('descricao') ?? null) || undefined,
      preco: finalPrice,
      precoCusto: precoCusto ?? undefined,
      margemLucro: precoCusto && precoCusto > 0 ? ((finalPrice - precoCusto) / precoCusto) * 100 : undefined,
      estoque: estoque ?? 0,
      estoqueMinimo: estoqueMinimo ?? undefined,
      unidadeMedida: parseUnit(values.get('unidadeMedida') ?? null),
      categoria,
      sku: cellText(values.get('sku') ?? null) || undefined,
      codigoBarras: cellText(values.get('codigoBarras') ?? null) || undefined,
      fornecedor: cellText(values.get('fornecedor') ?? null) || undefined,
      validade: parseDate(values.get('validade') ?? null),
      lote: cellText(values.get('lote') ?? null) || undefined,
      localizacao: cellText(values.get('localizacao') ?? null) || undefined,
      linkProduto,
      status: parseStatus(values.get('status') ?? null),
      tags: cellText(values.get('tags') ?? null)
        .split(/[,;|]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
      dadosImportados: Object.keys(extra).length ? extra : undefined,
    };

    return { sourceRow: parsed.headerRow + rowIndex + 2, data, errors, warnings };
  });
}

export function productIdentity(product: Pick<Produto, 'nome' | 'sku' | 'codigoBarras'>): string[] {
  const identities: string[] = [];
  if (product.codigoBarras) identities.push(`barcode:${normalizeText(product.codigoBarras)}`);
  if (product.sku) identities.push(`sku:${normalizeText(product.sku)}`);
  if (product.nome) identities.push(`name:${normalizeText(product.nome)}`);
  return identities;
}
