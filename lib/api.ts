import type { Produto, Categoria, Venda, Cliente, PaginatedResult, Despesa } from './types';
import { auth, db } from '@/src/firebase';

import {
  collection,
  addDoc,
  getDoc,
  getDocFromServer,
  getDocs,
  getDocsFromServer,
  updateDoc,
  deleteDoc,
  doc,
  query,
  runTransaction,
  where,
  writeBatch,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

// ═══════════════ Auth helper ═══════════════

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

export interface ProdutoImportUpdate {
  id: string;
  data: Record<string, unknown>;
}

/** Salva importações grandes em lotes abaixo do limite de 500 operações do Firestore. */
export async function saveImportedProducts(
  newProducts: Array<Record<string, unknown>>,
  updates: ProdutoImportUpdate[] = []
): Promise<void> {
  const { uid, email } = getCurrentAccount();
  const now = new Date().toISOString();
  const operations: Array<
    | { kind: 'create'; data: Record<string, unknown> }
    | { kind: 'update'; id: string; data: Record<string, unknown> }
  > = [
    ...newProducts.map((data) => ({ kind: 'create' as const, data })),
    ...updates.map((update) => ({ kind: 'update' as const, ...update })),
  ];

  for (let start = 0; start < operations.length; start += 400) {
    const batch = writeBatch(db);
    for (const operation of operations.slice(start, start + 400)) {
      if (operation.kind === 'create') {
        const reference = doc(collection(db, 'empresas', uid, 'produtos'));
        batch.set(reference, {
          ...removeUndefinedFields(operation.data),
          proprietarioUid: uid,
          proprietarioEmail: email,
          criadoEm: now,
          atualizadoEm: now,
        });
      } else {
        batch.update(doc(db, 'empresas', uid, 'produtos', operation.id), {
          ...removeUndefinedFields(operation.data),
          atualizadoEm: now,
        });
      }
    }
    await batch.commit();
  }
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

// Os produtos guardam a categoria pelo nome (é o que as telas e relatórios usam).
// Ignora produtos cujo categoriaId aponta para outra categoria com o mesmo nome.
async function getProdutosDaCategoria(
  uid: string,
  categoriaId: string,
  nome: string
): Promise<QueryDocumentSnapshot[]> {
  const snapshot = await getDocs(
    query(collection(db, 'empresas', uid, 'produtos'), where('categoria', '==', nome))
  );
  return snapshot.docs.filter((produto) => {
    const produtoCategoriaId = produto.data().categoriaId;
    return !produtoCategoriaId || produtoCategoriaId === categoriaId;
  });
}

export async function updateCategoria(
  data: Record<string, unknown>
): Promise<void> {
  const uid = getUserUid();

  if (!data.id) {
    throw new Error('ID da categoria não informado');
  }

  const id = String(data.id);
  const categoriaRef = doc(db, 'empresas', uid, 'categorias', id);
  const categoria = { ...data };
  delete categoria.id;
  const now = new Date().toISOString();

  const anterior = await getDoc(categoriaRef);
  if (!anterior.exists()) throw new Error('Esta categoria não existe mais.');
  const nomeAnterior = String(anterior.data().nome ?? '');
  const novoNome = typeof categoria.nome === 'string' ? categoria.nome : nomeAnterior;
  const produtos = nomeAnterior && novoNome !== nomeAnterior
    ? await getProdutosDaCategoria(uid, id, nomeAnterior)
    : [];

  // Renomeia a categoria e os produtos dela juntos, em lotes abaixo do limite de 500 operações.
  const operacoes = [
    { ref: categoriaRef, data: { ...removeUndefinedFields(categoria), atualizadoEm: now } },
    ...produtos.map((produto) => ({
      ref: produto.ref,
      data: { categoria: novoNome, categoriaId: id, atualizadoEm: now },
    })),
  ];
  for (let start = 0; start < operacoes.length; start += 400) {
    const batch = writeBatch(db);
    for (const operacao of operacoes.slice(start, start + 400)) {
      batch.update(operacao.ref, operacao.data);
    }
    await batch.commit();
  }
}

export async function deleteCategoria(
  id: string
): Promise<void> {
  const uid = getUserUid();
  const categoriaRef = doc(db, 'empresas', uid, 'categorias', id);

  const categoria = await getDoc(categoriaRef);
  if (categoria.exists()) {
    const produtos = await getProdutosDaCategoria(uid, id, String(categoria.data().nome ?? ''));
    if (produtos.length > 0) {
      throw new Error(
        `Esta categoria é usada por ${produtos.length} produto(s). Mude a categoria desses produtos antes de excluí-la.`
      );
    }
  }

  await deleteDoc(categoriaRef);
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

// ═══════════════ Estoque ═══════════════
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
