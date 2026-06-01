import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, senha } = body;

    if (!email || !senha) {
      return NextResponse.json(
        { erro: 'E-mail e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // TEMPORÁRIO:
    // Simula um usuário para evitar dependência do Prisma

    const usuario = {
      id: 1,
      nome_responsavel: 'Usuário Teste',
      email: email.trim(),
      senha: await bcrypt.hash('123456', 10),
    };

    const senhaValida = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaValida) {
      return NextResponse.json(
        { erro: 'Senha incorreta' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      mensagem: 'Login realizado com sucesso',
      token: 'token_fake_123',
      usuario: {
        id: usuario.id,
        nome: usuario.nome_responsavel,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}