import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import type { Firestore } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin';
import {
  arredondarQuantidade,
  encontrarProduto,
  formatarDinheiro,
  formatarQuantidade,
  nomeDoProduto,
  normalizar,
  validarComando,
  type ComandoEsp,
  type ItemComandoEsp,
} from '@/lib/espComando';
import type { Categoria, ItemVenda, Produto, Venda } from '@/lib/types';

// Recebe do servidor de voz do PC (projeto esp32-cortex) o comando já transcrito e
// interpretado, por exemplo "vendi dois brigadeiros" ou "adicionar 1 coca valor 12 reais",
// e grava na conta configurada em ESP32_EMPRESA_EMAIL:
//   baixa    -> cria a venda e desconta o estoque (mesmas regras de registrarVenda em lib/api.ts)
//   entrada  -> soma no estoque; produto novo é cadastrado se a frase disser o preço
//   cadastro -> cria o produto (preço obrigatório, estoque 0 se a frase não disser quantidade)
// Só aceita pedidos com o segredo ESP32_SITE_TOKEN no cabeçalho X-CortexAI-Token.

type ProdutoSalvo = Partial<Produto> & { id: string; nome: string };
type CategoriaSalva = { id: string; nome: string };
type Conta = { uid: string; email: string | null };
type Correspondencia = { item: ItemComandoEsp; produto: ProdutoSalvo | null };

class ErroComando extends Error {
  constructor(readonly status: number, readonly codigo: string, mensagem: string) {
    super(mensagem);
  }
}

function responderErro(status: number, erro: string, mensagem: string) {
  return NextResponse.json({ sucesso: false, erro, mensagem }, { status });
}

/** Responde 401/503 quando o token não confere; null quando o pedido pode seguir. */
function verificarToken(req: NextRequest): NextResponse | null {
  const esperado = process.env.ESP32_SITE_TOKEN ?? '';
  if (esperado.length < 24) {
    return responderErro(503, 'TOKEN_NAO_CONFIGURADO', 'Configure ESP32_SITE_TOKEN (mínimo 24 caracteres) no .env.local do site.');
  }
  const a = Buffer.from(esperado);
  const b = Buffer.from(req.headers.get('x-cortexai-token') ?? '');
  // Comparação em tempo constante: não revela quantos caracteres do token estão certos.
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return responderErro(401, 'NAO_AUTORIZADO', 'Token do servidor de voz incorreto.');
  }
  return null;
}

let contaEmCache: { email: string; conta: Conta } | null = null;

async function contaDaEmpresa(): Promise<Conta> {
  const email = (process.env.ESP32_EMPRESA_EMAIL ?? '').trim().toLowerCase();
  if (!email) throw new ErroComando(503, 'CONTA_NAO_CONFIGURADA', 'Configure ESP32_EMPRESA_EMAIL no .env.local do site.');
  if (contaEmCache?.email === email) return contaEmCache.conta;
  try {
    const usuario = await getAdminAuth().getUserByEmail(email);
    contaEmCache = { email, conta: { uid: usuario.uid, email: usuario.email ?? email } };
    return contaEmCache.conta;
  } catch (erro) {
    if ((erro as { code?: string }).code === 'auth/user-not-found') {
      throw new ErroComando(503, 'CONTA_NAO_ENCONTRADA', `Nenhuma conta do sistema usa o e-mail ${email}.`);
    }
    throw erro;
  }
}

async function carregarProdutos(db: Firestore, uid: string): Promise<ProdutoSalvo[]> {
  const snapshot = await db.collection('empresas').doc(uid).collection('produtos').get();
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as Partial<Produto>) }))
    .filter((produto): produto is ProdutoSalvo => typeof produto.nome === 'string' && produto.nome.trim() !== '');
}

/** Soma itens repetidos do mesmo produto ("1 coca e mais 1 coca"), como registrarVenda faz. */
function agruparPorProduto(correspondencias: Correspondencia[]) {
  const grupos = new Map<string, { quantidade: number; preco: number | null }>();
  for (const { item, produto } of correspondencias) {
    if (!produto) continue;
    const atual = grupos.get(produto.id);
    grupos.set(produto.id, {
      quantidade: arredondarQuantidade((atual?.quantidade ?? 0) + item.quantidade),
      preco: item.preco ?? atual?.preco ?? null,
    });
  }
  return grupos;
}

async function gravarVendaPorVoz(db: Firestore, conta: Conta, comando: ComandoEsp, correspondencias: Correspondencia[]) {
  const faltando = correspondencias.filter((c) => !c.produto).map((c) => c.item.nome);
  if (faltando.length) {
    throw new ErroComando(
      422,
      'PRODUTO_NAO_ENCONTRADO',
      `Não encontrei ${faltando.join(', ')} no cadastro. Cadastre antes de vender, ex.: adicionar 1 ${faltando[0]} valor 10 reais.`
    );
  }
  const grupos = agruparPorProduto(correspondencias);
  const empresa = db.collection('empresas').doc(conta.uid);

  // Transação: lê o estoque, confere e grava venda + baixa juntas (ou nada, se algo falhar).
  return db.runTransaction(async (transacao) => {
    const refs = [...grupos.keys()].map((id) => empresa.collection('produtos').doc(id));
    const snapshots = await transacao.getAll(...refs);
    const agora = new Date().toISOString();

    const itens: ItemVenda[] = snapshots.map((snapshot, indice) => {
      const grupo = grupos.get(snapshot.id);
      if (!snapshot.exists || !grupo) throw new ErroComando(409, 'PRODUTO_REMOVIDO', 'Um dos produtos não existe mais.');
      const produto = snapshot.data() as Partial<Produto>;
      const nome = produto.nome || 'Produto';
      // Preço falado ("vendi 1 coca por 12 reais") vale para esta venda; senão, o do cadastro.
      const precoUnitario = grupo.preco ?? Number(produto.preco);
      if (!Number.isFinite(precoUnitario) || precoUnitario < 0) {
        throw new ErroComando(422, 'PRECO_INVALIDO', `${nome} está sem preço válido no cadastro.`);
      }
      const estoqueAtual = Number(produto.estoque);
      if (!Number.isFinite(estoqueAtual) || estoqueAtual < 0) {
        throw new ErroComando(422, 'ESTOQUE_INVALIDO', `Configure o estoque de ${nome} antes de vender.`);
      }
      if (estoqueAtual < grupo.quantidade) {
        throw new ErroComando(409, 'ESTOQUE_INSUFICIENTE', `Estoque insuficiente de ${nome}: só tem ${formatarQuantidade(estoqueAtual)}.`);
      }
      transacao.update(refs[indice], { estoque: arredondarQuantidade(estoqueAtual - grupo.quantidade), atualizadoEm: agora });
      return {
        produtoId: snapshot.id,
        nome,
        categoria: produto.categoria || 'Sem categoria',
        quantidade: grupo.quantidade,
        precoUnitario,
        subtotal: precoUnitario * grupo.quantidade,
        unidadeMedida: produto.unidadeMedida || 'unidade',
      };
    });

    const total = itens.reduce((soma, item) => soma + item.subtotal, 0);
    const vendaRef = empresa.collection('vendas').doc();
    const venda: Omit<Venda, 'id'> = {
      itens,
      quantidadeItens: itens.reduce((soma, item) => soma + item.quantidade, 0),
      subtotal: total,
      desconto: 0,
      total,
      metodoPagamento: 'outro',
      clienteId: null,
      clienteNome: null,
      observacao: `Venda por voz (ESP32): "${comando.texto}"`,
      status: 'concluida',
      proprietarioUid: conta.uid,
      proprietarioEmail: conta.email,
      criadoEm: agora,
      atualizadoEm: agora,
    };
    transacao.set(vendaRef, venda);

    const partes = itens.map((item) => `${formatarQuantidade(item.quantidade)}x ${item.nome}`);
    return { vendaId: vendaRef.id, total, resumo: `Venda registrada: ${partes.join(', ')} = ${formatarDinheiro(total)}` };
  });
}

async function carregarCategorias(db: Firestore, uid: string): Promise<CategoriaSalva[]> {
  const snapshot = await db.collection('empresas').doc(uid).collection('categorias').get();
  return snapshot.docs
    .map((doc) => ({ id: doc.id, nome: (doc.data() as Partial<Categoria>).nome }))
    .filter((categoria): categoria is CategoriaSalva => typeof categoria.nome === 'string' && categoria.nome.trim() !== '');
}

/** Categoria falada ("categoria bebidas") -> categoria cadastrada; sem correspondência fica em "Sem categoria". */
function escolherCategoria(falada: string | null, categorias: CategoriaSalva[]) {
  if (!falada) return { categoria: 'Sem categoria', categoriaId: null as string | null, aviso: '' };
  const { produto: encontrada } = encontrarProduto(falada, categorias);
  if (encontrada) return { categoria: encontrada.nome, categoriaId: encontrada.id as string | null, aviso: '' };
  return { categoria: 'Sem categoria', categoriaId: null as string | null, aviso: ` (categoria "${falada}" não encontrada)` };
}

/** Mesmos campos que a tela de Produtos grava em createProduto. */
function dadosProdutoNovo(
  conta: Conta,
  agora: string,
  novo: { nome: string; preco: number; estoque: number },
  categoria: { categoria: string; categoriaId: string | null }
) {
  return {
    nome: novo.nome,
    preco: novo.preco,
    estoque: novo.estoque,
    unidadeMedida: 'unidade',
    categoria: categoria.categoria,
    categoriaId: categoria.categoriaId,
    status: 'ativo',
    descricao: 'Cadastrado por voz pelo ESP32.',
    proprietarioUid: conta.uid,
    proprietarioEmail: conta.email,
    criadoEm: agora,
    atualizadoEm: agora,
  };
}

async function gravarCadastroPorVoz(db: Firestore, conta: Conta, correspondencias: Correspondencia[]) {
  const semPreco = correspondencias.find((c) => c.item.preco === null);
  if (semPreco) {
    throw new ErroComando(
      422,
      'CADASTRO_SEM_PRECO',
      `Diga o preço para cadastrar, ex.: cadastrar ${semPreco.item.nomeFalado} valor 10 reais.`
    );
  }
  // Cadastrar não mexe em produto existente: evita duplicar "Coca" ou alterar o estoque sem querer.
  const existente = correspondencias.find((c) => c.produto);
  if (existente?.produto) {
    throw new ErroComando(
      409,
      'PRODUTO_JA_CADASTRADO',
      `Já existe o produto ${existente.produto.nome}. Para somar no estoque, use "adicionar"; para um produto novo, fale outro nome.`
    );
  }
  const novos = new Map<string, { nome: string; preco: number; estoque: number; categoria: string | null }>();
  for (const { item } of correspondencias) {
    const chave = normalizar(item.nome);
    const atual = novos.get(chave);
    novos.set(chave, {
      nome: nomeDoProduto(item.nomeFalado),
      preco: item.preco ?? atual?.preco ?? 0,
      // Sem quantidade falada ("cadastrar coca valor 12 reais"), o produto começa com estoque 0.
      estoque: arredondarQuantidade((atual?.estoque ?? 0) + (item.quantidadeExplicita ? item.quantidade : 0)),
      categoria: item.categoria ?? atual?.categoria ?? null,
    });
  }
  const categorias = await carregarCategorias(db, conta.uid);
  const empresa = db.collection('empresas').doc(conta.uid);
  const lote = db.batch();
  const agora = new Date().toISOString();
  const partes: string[] = [];
  for (const novo of novos.values()) {
    const categoria = escolherCategoria(novo.categoria, categorias);
    lote.set(empresa.collection('produtos').doc(), dadosProdutoNovo(conta, agora, novo, categoria));
    const onde = categoria.categoriaId ? `, categoria ${categoria.categoria}` : ', sem categoria';
    partes.push(`${novo.nome}, ${formatarDinheiro(novo.preco)}, estoque ${formatarQuantidade(novo.estoque)}${onde}${categoria.aviso}`);
  }
  await lote.commit();
  return { resumo: `${partes.length > 1 ? 'Produtos cadastrados' : 'Produto cadastrado'}: ${partes.join('; ')}` };
}

async function gravarEntradaPorVoz(db: Firestore, conta: Conta, correspondencias: Correspondencia[]) {
  const novoSemPreco = correspondencias.find((c) => !c.produto && c.item.preco === null);
  if (novoSemPreco) {
    const nome = novoSemPreco.item.nomeFalado;
    throw new ErroComando(
      422,
      'PRODUTO_NOVO_SEM_PRECO',
      `"${nome}" ainda não está cadastrado. Diga o valor para cadastrar, ex.: cadastrar ${nome} valor 10 reais.`
    );
  }
  const existentes = agruparPorProduto(correspondencias);
  const novos = new Map<string, { nome: string; estoque: number; preco: number; categoria: string | null }>();
  for (const { item, produto } of correspondencias) {
    if (produto) continue;
    const chave = normalizar(item.nome);
    const atual = novos.get(chave);
    novos.set(chave, {
      nome: nomeDoProduto(item.nomeFalado),
      estoque: arredondarQuantidade((atual?.estoque ?? 0) + item.quantidade),
      preco: item.preco ?? atual?.preco ?? 0,
      categoria: item.categoria ?? atual?.categoria ?? null,
    });
  }
  const categorias = novos.size ? await carregarCategorias(db, conta.uid) : [];
  const empresa = db.collection('empresas').doc(conta.uid);

  return db.runTransaction(async (transacao) => {
    const refs = [...existentes.keys()].map((id) => empresa.collection('produtos').doc(id));
    const snapshots = refs.length ? await transacao.getAll(...refs) : [];
    const agora = new Date().toISOString();
    const partes: string[] = [];

    snapshots.forEach((snapshot, indice) => {
      const grupo = existentes.get(snapshot.id);
      if (!snapshot.exists || !grupo) throw new ErroComando(409, 'PRODUTO_REMOVIDO', 'Um dos produtos não existe mais.');
      const produto = snapshot.data() as Partial<Produto>;
      const estoqueAtual = Number(produto.estoque);
      const estoque = arredondarQuantidade((Number.isFinite(estoqueAtual) && estoqueAtual > 0 ? estoqueAtual : 0) + grupo.quantidade);
      transacao.update(
        refs[indice],
        grupo.preco === null ? { estoque, atualizadoEm: agora } : { estoque, preco: grupo.preco, atualizadoEm: agora }
      );
      const preco = grupo.preco === null ? '' : `, preço ${formatarDinheiro(grupo.preco)}`;
      partes.push(`+${formatarQuantidade(grupo.quantidade)} ${produto.nome || 'Produto'} (agora ${formatarQuantidade(estoque)}${preco})`);
    });

    for (const novo of novos.values()) {
      const categoria = escolherCategoria(novo.categoria, categorias);
      transacao.set(empresa.collection('produtos').doc(), dadosProdutoNovo(conta, agora, novo, categoria));
      partes.push(
        `novo produto ${novo.nome}: ${formatarQuantidade(novo.estoque)} un. a ${formatarDinheiro(novo.preco)}${categoria.aviso}`
      );
    }
    return { resumo: `Estoque atualizado: ${partes.join('; ')}` };
  });
}

export async function POST(req: NextRequest) {
  const negado = verificarToken(req);
  if (negado) return negado;
  if (Number(req.headers.get('content-length') || 0) > 10_000) {
    return responderErro(413, 'COMANDO_GRANDE', 'Comando grande demais.');
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return responderErro(400, 'JSON_INVALIDO', 'Corpo da requisição inválido.');
  }
  const validacao = validarComando(corpo);
  if (!validacao.ok) return responderErro(400, 'COMANDO_INVALIDO', validacao.mensagem);
  const comando = validacao.comando;
  // Sem verbo não dá para saber o que fazer: melhor não gravar nada.
  if (!comando.acaoExplicita) {
    return responderErro(422, 'SEM_ACAO', 'Comece a frase com "vendi", "adicionar" ou "cadastrar".');
  }

  try {
    const conta = await contaDaEmpresa();
    const db = getAdminDb();
    const produtos = await carregarProdutos(db, conta.uid);
    const correspondencias: Correspondencia[] = [];
    for (const item of comando.itens) {
      const { produto, ambiguo } = encontrarProduto(item.nome, produtos);
      // No cadastro, qualquer produto parecido já basta para recusar (ver gravarCadastroPorVoz).
      if (ambiguo && comando.acao !== 'cadastro') {
        throw new ErroComando(422, 'PRODUTO_AMBIGUO', `"${item.nomeFalado}" combina com mais de um produto. Fale o nome completo.`);
      }
      correspondencias.push({ item, produto });
    }
    const resultado =
      comando.acao === 'baixa' ? await gravarVendaPorVoz(db, conta, comando, correspondencias)
      : comando.acao === 'cadastro' ? await gravarCadastroPorVoz(db, conta, correspondencias)
      : await gravarEntradaPorVoz(db, conta, correspondencias);
    return NextResponse.json({ sucesso: true, acao: comando.acao, ...resultado });
  } catch (erro) {
    if (erro instanceof ErroComando) return responderErro(erro.status, erro.codigo, erro.message);
    console.error('[ESP32] Falha ao gravar comando de voz:', erro);
    return responderErro(500, 'FALHA_INTERNA', 'Não foi possível gravar no sistema. Veja o terminal do site.');
  }
}

/** Diagnóstico para a configuração: confirma token, conta e quantos produtos ela tem. */
export async function GET(req: NextRequest) {
  const negado = verificarToken(req);
  if (negado) return negado;
  try {
    const conta = await contaDaEmpresa();
    const produtos = await carregarProdutos(getAdminDb(), conta.uid);
    return NextResponse.json({ sucesso: true, conta: conta.email, produtos: produtos.length });
  } catch (erro) {
    if (erro instanceof ErroComando) return responderErro(erro.status, erro.codigo, erro.message);
    console.error('[ESP32] Falha no diagnóstico:', erro);
    return responderErro(500, 'FALHA_INTERNA', 'Firebase indisponível. Veja o terminal do site.');
  }
}
