import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb, initializeFirebaseAdmin } from '@/lib/firebaseAdmin';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let createdUserId: string | null = null;

  try {
    const body = await req.json();
    const { empresa, responsavel, email, telefone, cpfCnpj, senha } = body ?? {};

    if ([empresa, responsavel, email, telefone, cpfCnpj, senha].some((value) => typeof value !== 'string')) {
      return NextResponse.json({ erro: 'Dados de cadastro inválidos' }, { status: 400 });
    }

    const empresaLimpa = empresa.trim();
    const responsavelLimpo = responsavel.trim();
    const emailLimpo = email.trim().toLowerCase();
    const telefoneLimpo = telefone.replace(/\D/g, '');
    const cpfCnpjLimpo = cpfCnpj.replace(/\D/g, '');

    if (!empresaLimpa || !responsavelLimpo || !emailLimpo || !telefoneLimpo || !cpfCnpjLimpo || !senha) {
      return NextResponse.json({ erro: 'Todos os campos são obrigatórios' }, { status: 400 });
    }
    if (!emailRegex.test(emailLimpo)) {
      return NextResponse.json({ erro: 'E-mail inválido' }, { status: 400 });
    }
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      return NextResponse.json({ erro: 'Telefone inválido' }, { status: 400 });
    }
    if (cpfCnpjLimpo.length !== 11 && cpfCnpjLimpo.length !== 14) {
      return NextResponse.json({ erro: 'CPF ou CNPJ inválido' }, { status: 400 });
    }
    if (senha.length < 6) {
      return NextResponse.json({ erro: 'A senha deve ter ao menos 6 caracteres' }, { status: 400 });
    }

    initializeFirebaseAdmin();
    const auth = getAdminAuth();
    const db = getAdminDb();
    const userRecord = await auth.createUser({
      email: emailLimpo,
      password: senha,
      displayName: responsavelLimpo,
    });
    createdUserId = userRecord.uid;

    const now = new Date().toISOString();
    await db.collection('empresas').doc(userRecord.uid).set({
      empresa: empresaLimpa,
      responsavel: responsavelLimpo,
      email: emailLimpo,
      telefone: telefoneLimpo,
      cpfCnpj: cpfCnpjLimpo,
      criadoEm: now,
      atualizadoEm: now,
    });

    const token = await auth.createCustomToken(userRecord.uid);
    return NextResponse.json({
      sucesso: true,
      mensagem: 'Cadastro realizado com sucesso',
      token,
      usuario: { id: userRecord.uid, nome: responsavelLimpo, email: emailLimpo },
    }, { status: 201 });
  } catch (error: unknown) {
    if (createdUserId) {
      try {
        await getAdminAuth().deleteUser(createdUserId);
      } catch (rollbackError) {
        console.error('Erro ao desfazer cadastro incompleto:', rollbackError);
      }
    }

    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
    if (code === 'auth/email-already-exists') {
      return NextResponse.json({ erro: 'Este e-mail já está cadastrado' }, { status: 400 });
    }
    console.error('Erro ao criar cadastro:', error);
    return NextResponse.json({ erro: 'Não foi possível concluir o cadastro. Tente novamente.' }, { status: 500 });
  }
}
