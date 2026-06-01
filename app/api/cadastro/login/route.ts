import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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

    // 🔎 Busca usuário no banco pelo e-mail cadastrado
    const usuario = await prisma.cadastro.findFirst({
      where: {
        email: {
          equals: email.trim(),
          mode: 'insensitive'
        }
      }
    });

    if (!usuario) {
      return NextResponse.json(
        { erro: 'Usuário não encontrado com esse e-mail' },
        { status: 401 }
      );
    }

    // 🔐 Verifica senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return NextResponse.json(
        { erro: 'Senha incorreta' },
        { status: 401 }
      );
    }

    // 🔑 Aqui você pode gerar JWT (opcional)
    // Por enquanto vamos simular um token
    const token = 'token_fake_123';

    return NextResponse.json({
      mensagem: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome_responsavel,
        email: usuario.email
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}