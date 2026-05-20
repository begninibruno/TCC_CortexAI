import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Cadastro request body:', body);
    const { empresa, responsavel, email, telefone, identificador, senha } = body;

    if (!empresa || !responsavel || !email || !telefone || !identificador || !senha) {
      return NextResponse.json(
        { erro: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    const identificadorLimpo = identificador.replace(/\D/g, '');
    console.log('Cadastro request values:', { empresa, responsavel, email, telefone, identificador: identificadorLimpo });

    const usuarioExistente = await prisma.cadastro.findUnique({
      where: {
        identificador: identificadorLimpo
      }
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { erro: 'CPF/CNPJ já cadastrado' },
        { status: 409 }
      );
    }

    const emailJaUsado = await prisma.cadastro.findUnique({
      where: {
        email
      }
    });

    if (emailJaUsado) {
      return NextResponse.json(
        { erro: 'E-mail já cadastrado' },
        { status: 409 }
      );
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await prisma.cadastro.create({
      data: {
        nome_empresa: empresa,
        nome_responsavel: responsavel,
        email,
        telefone,
        identificador: identificadorLimpo,
        senha: senhaHash
      }
    });

    return NextResponse.json({
      mensagem: 'Cadastro realizado com sucesso',
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome_responsavel,
        email: novoUsuario.email
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