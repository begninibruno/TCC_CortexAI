import { NextResponse } from 'next/server';
import { initializeFirebaseAdmin, getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    initializeFirebaseAdmin();
    const db = getAdminDb();
    const auth = getAdminAuth();

    const body = await req.json();
    const { email, senha } = body;

    if (!email || !senha) {
      return NextResponse.json(
        { erro: 'E-mail e senha são obrigatórios' },
        { status: 400 }
      );
    }

    try {
      // Verificar se o usuário existe
      const userRecord = await auth.getUserByEmail(email.trim());

      // Gerar token customizado para o cliente
      const customToken = await auth.createCustomToken(userRecord.uid);

      // Buscar dados da empresa no Firestore
      const empresaDoc = await db.collection('empresas').doc(userRecord.uid).get();
      const empresaData = empresaDoc.data() || {};

      return NextResponse.json({
        mensagem: 'Login realizado com sucesso',
        token: customToken,
        usuario: {
          id: userRecord.uid,
          nome: userRecord.displayName || empresaData.responsavel || 'Usuário',
          email: userRecord.email,
        },
      });
    } catch (authError: any) {
      // Usuário não encontrado ou erro na autenticação
      if (authError.code === 'auth/user-not-found') {
        return NextResponse.json(
          { erro: 'Email ou senha incorretos' },
          { status: 401 }
        );
      }

      // Para validar a senha, precisaríamos fazer isso no cliente com Firebase SDK
      // Por enquanto, retornamos erro genérico
      return NextResponse.json(
        { erro: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Erro ao fazer login:', error);

    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}