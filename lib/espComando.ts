// Regras do comando de voz que chega do ESP32 pelo servidor de voz do PC:
// validação do pedido e busca aproximada do produto pelo nome falado.
// Não acessa o Firebase; a gravação fica em app/api/esp/comando/route.ts.

export type AcaoEsp = 'baixa' | 'entrada' | 'cadastro';

export interface ItemComandoEsp {
  /** Nome sem acentos, usado para comparar com os produtos cadastrados. */
  nome: string;
  /** Nome como foi falado (com acentos), usado ao cadastrar um produto novo. */
  nomeFalado: string;
  quantidade: number;
  /** false quando a frase não disse quantidade ("cadastrar coca valor 12 reais"). */
  quantidadeExplicita: boolean;
  preco: number | null;
  categoria: string | null;
}

export interface ComandoEsp {
  texto: string;
  acao: AcaoEsp;
  acaoExplicita: boolean;
  itens: ItemComandoEsp[];
}

const LIMITE_ITENS = 10;
const LIMITE_QUANTIDADE = 9999;
const LIMITE_PRECO = 1_000_000;

export function arredondarQuantidade(quantidade: number): number {
  return Math.round(quantidade * 1000) / 1000;
}

export function formatarDinheiro(valor: number): string {
  // Sem toLocaleString: o espaço especial do pt-BR não aparece na tela do ESP32.
  return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

export function formatarQuantidade(quantidade: number): string {
  return String(arredondarQuantidade(quantidade)).replace('.', ',');
}

export function validarComando(corpo: unknown): { ok: true; comando: ComandoEsp } | { ok: false; mensagem: string } {
  if (!corpo || typeof corpo !== 'object') return { ok: false, mensagem: 'Corpo da requisição inválido.' };
  const { texto, acao, acaoExplicita, itens } = corpo as Record<string, unknown>;

  if (typeof texto !== 'string' || !texto.trim() || texto.length > 300) {
    return { ok: false, mensagem: 'Texto do comando inválido.' };
  }
  if (acao !== 'baixa' && acao !== 'entrada' && acao !== 'cadastro') {
    return { ok: false, mensagem: 'Ação inválida: use baixa, entrada ou cadastro.' };
  }
  if (typeof acaoExplicita !== 'boolean') return { ok: false, mensagem: 'Campo acaoExplicita inválido.' };
  if (!Array.isArray(itens) || itens.length === 0) return { ok: false, mensagem: 'Nenhum produto foi entendido na frase.' };
  if (itens.length > LIMITE_ITENS) return { ok: false, mensagem: `Fale no máximo ${LIMITE_ITENS} produtos por vez.` };

  const lista: ItemComandoEsp[] = [];
  for (const item of itens) {
    if (!item || typeof item !== 'object') return { ok: false, mensagem: 'Item do comando inválido.' };
    const { nome, nomeFalado, quantidade, quantidadeExplicita, preco, categoria } = item as Record<string, unknown>;
    if (typeof nome !== 'string' || !nome.trim() || nome.length > 80) {
      return { ok: false, mensagem: 'Nome de produto inválido.' };
    }
    if (nomeFalado !== undefined && (typeof nomeFalado !== 'string' || !nomeFalado.trim() || nomeFalado.length > 80)) {
      return { ok: false, mensagem: 'Nome de produto inválido.' };
    }
    if (quantidadeExplicita !== undefined && typeof quantidadeExplicita !== 'boolean') {
      return { ok: false, mensagem: 'Campo quantidadeExplicita inválido.' };
    }
    const semCategoria = categoria === null || categoria === undefined;
    if (!semCategoria && (typeof categoria !== 'string' || !categoria.trim() || categoria.length > 60)) {
      return { ok: false, mensagem: 'Categoria inválida.' };
    }
    if (typeof quantidade !== 'number' || !Number.isFinite(quantidade) || quantidade <= 0 || quantidade > LIMITE_QUANTIDADE) {
      return { ok: false, mensagem: `Quantidade inválida para ${nome}.` };
    }
    const semPreco = preco === null || preco === undefined;
    if (!semPreco && (typeof preco !== 'number' || !Number.isFinite(preco) || preco < 0 || preco > LIMITE_PRECO)) {
      return { ok: false, mensagem: `Preço inválido para ${nome}.` };
    }
    lista.push({
      nome: nome.trim(),
      nomeFalado: typeof nomeFalado === 'string' ? nomeFalado.trim() : nome.trim(),
      quantidade: arredondarQuantidade(quantidade),
      quantidadeExplicita: quantidadeExplicita !== false,
      preco: semPreco ? null : Math.round((preco as number) * 100) / 100,
      categoria: semCategoria ? null : (categoria as string).trim(),
    });
  }
  return { ok: true, comando: { texto: texto.trim(), acao, acaoExplicita, itens: lista } };
}

// ─── Busca aproximada (mesma lógica do interpretador do servidor de voz) ───

const RUIDO = new Set(['de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'o', 'a', 'os', 'as', 'e', 'com']);

export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let anterior = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const atual = [i];
    for (let j = 1; j <= b.length; j++) {
      atual[j] = Math.min(anterior[j] + 1, atual[j - 1] + 1, anterior[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    anterior = atual;
  }
  return anterior[b.length];
}

const singular = (palavra: string) => (palavra.length > 3 && palavra.endsWith('s') ? palavra.slice(0, -1) : palavra);

function similaridade(a: string, b: string): number {
  a = singular(a);
  b = singular(b);
  if (a === b) return 1;
  // "pres" (de "Pres. Perdigao") combina com "presunto".
  if (Math.min(a.length, b.length) >= 3 && (a.startsWith(b) || b.startsWith(a))) return 0.88;
  return Math.max(0, 1 - levenshtein(a, b) / Math.max(a.length, b.length));
}

const palavras = (texto: string) => normalizar(texto).split(' ').filter((p) => p && !RUIDO.has(p));

/** Nota de 0 a 100: quanto do que foi falado bate com o nome e quanto do nome foi falado. */
function pontuar(falado: string, nomeProduto: string): number {
  const consulta = palavras(falado);
  const produto = palavras(nomeProduto);
  if (!consulta.length || !produto.length) return 0;
  let soma = 0;
  const usadas = new Set<number>();
  for (const palavra of consulta) {
    let melhor = 0;
    let indice = -1;
    produto.forEach((p, k) => {
      const nota = similaridade(palavra, p);
      if (nota > melhor) {
        melhor = nota;
        indice = k;
      }
    });
    if (melhor >= 0.7) {
      soma += melhor;
      usadas.add(indice);
    }
  }
  const precisao = soma / consulta.length;
  const cobertura = usadas.size / produto.length;
  return Math.round(100 * precisao * (0.6 + 0.4 * cobertura));
}

export function encontrarProduto<T extends { nome: string }>(
  nomeFalado: string,
  produtos: T[]
): { produto: T | null; confianca: number; ambiguo: boolean } {
  const ranking = produtos
    .map((produto) => ({ produto, nota: pontuar(nomeFalado, produto.nome) }))
    .sort((a, b) => b.nota - a.nota);
  const melhor = ranking[0];
  if (!melhor || melhor.nota < 60) return { produto: null, confianca: melhor?.nota ?? 0, ambiguo: false };
  const ambiguo = !!ranking[1] && ranking[1].nota >= 60 && ranking[1].nota >= melhor.nota - 5;
  return { produto: melhor.produto, confianca: melhor.nota, ambiguo };
}

/** "agua mineral" -> "Agua Mineral"; preposições continuam minúsculas ("Pao de Queijo"). */
export function nomeDoProduto(nomeFalado: string): string {
  return nomeFalado
    .trim()
    .split(/\s+/)
    .map((palavra, i) => (i > 0 && RUIDO.has(palavra) ? palavra : palavra.charAt(0).toUpperCase() + palavra.slice(1)))
    .join(' ');
}
