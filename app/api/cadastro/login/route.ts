import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identificador, senha } = body;

    if (!identificador || !senha) {
      return NextResponse.json(
        { erro: 'CPF/CNPJ e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // 🔹 Remove máscara (cpf/cnpj)
    const identificadorLimpo = identificador.replace(/\D/g, '');

    // 🔎 Busca usuário no banco por identificador
    let usuario = await prisma.cadastro.findUnique({
      where: {
        identificador: identificadorLimpo
      }
    });

    // Se não encontrar, tenta buscar por email
    if (!usuario) {
      usuario = await prisma.cadastro.findUnique({
        where: {
          email: identificador
        }
      });
    }

    if (!usuario) {
      return NextResponse.json(
        { erro: 'Usuário não encontrado' },
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