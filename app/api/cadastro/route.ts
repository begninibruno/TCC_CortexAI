// app/api/cadastro/route.ts

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { initializeFirebaseAdmin, getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    initializeFirebaseAdmin();
    const db = getAdminDb();
    const auth = getAdminAuth();

    const body = await req.json();

    const {
      empresa,
      responsavel,
      email,
      telefone,
      cpfCnpj,
      senha,
    } = body;

    // Validação básica
    if (
      !empresa ||
      !responsavel ||
      !email ||
      !telefone ||
      !cpfCnpj ||
      !senha
    ) {
      return NextResponse.json(
        { erro: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { erro: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validação CPF/CNPJ
    const cpfCnpjLimpo = cpfCnpj.replace(/\D/g, '');

    if (cpfCnpjLimpo.length !== 11 && cpfCnpjLimpo.length !== 14) {
      return NextResponse.json(
        { erro: 'CPF ou CNPJ inválido' },
        { status: 400 }
      );
    }

    // Validação telefone
    const telefoneLimpo = telefone.replace(/\D/g, '');

    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      return NextResponse.json(
        { erro: 'Telefone inválido' },
        { status: 400 }
      );
    }

    // Validação senha
    if (senha.length < 6) {
      return NextResponse.json(
        { erro: 'Senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    // Criar usuário no Firebase Auth
    const userRecord = await auth.createUser({
      email: email.trim(),
      password: senha,
      displayName: responsavel,
    });

    // Salvar dados da empresa no Firestore
    await db.collection('empresas').doc(userRecord.uid).set({
      empresa,
      responsavel,
      email: email.trim(),
      telefone: telefoneLimpo,
      cpfCnpj: cpfCnpjLimpo,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    });

    // Gerar token customizado
    const customToken = await auth.createCustomToken(userRecord.uid);

    return NextResponse.json(
      {
        sucesso: true,
        mensagem: 'Cadastro realizado com sucesso',
        token: customToken,
        usuario: {
          id: userRecord.uid,
          nome: responsavel,
          email: email.trim(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erro ao criar cadastro:', error);

    // Verificar se é erro de email já existente
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { erro: 'Este email já está cadastrado' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        erro: error.message || 'Erro interno ao processar cadastro',
      },
      { status: 500 }
    );
  }
}