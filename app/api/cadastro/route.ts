// app/api/cadastro/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import {
  PrismaClientKnownRequestError,
  PrismaClientInitializationError,
} from '@prisma/client/runtime/library';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { empresa, responsavel, email, telefone, cpfCnpj, senha } = body;

    // Validação básica
    if (!empresa || !responsavel || !email || !telefone || !cpfCnpj || !senha) {
      return NextResponse.json(
        { erro: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Validação de email básica
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { erro: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validação de CPF/CNPJ
    const cpfCnpjLimpo = cpfCnpj.replace(/\D/g, '');
    if (cpfCnpjLimpo.length !== 11 && cpfCnpjLimpo.length !== 14) {
      return NextResponse.json(
        { erro: 'CPF ou CNPJ inválido' },
        { status: 400 }
      );
    }

    // Validação de telefone básica
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      return NextResponse.json(
        { erro: 'Telefone inválido' },
        { status: 400 }
      );
    }

    // Validação de senha mínima
    if (senha.length < 6) {
      return NextResponse.json(
        { erro: 'Senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    // Criptografar a senha (salt de 10 rounds)
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novo = await prisma.cadastro.create({
      data: {
        nome_empresa: empresa,
        nome_responsavel: responsavel,
        email,
        telefone,
        cpf_cnpj: cpfCnpjLimpo,
        senha: senhaCriptografada,
      },
    });

    return NextResponse.json(
      { 
        sucesso: true,
        id: novo.id,
        mensagem: 'Cadastro realizado com sucesso'
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Tratamento específico de erros do Prisma
    if (error instanceof PrismaClientInitializationError) {
      console.error('Erro de conexão com o banco de dados:', error.message);
      return NextResponse.json(
        {
          erro: 'Não foi possível conectar ao banco de dados. Verifique se o PostgreSQL está em execução em localhost:5432.',
        },
        { status: 500 }
      );
    }

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const targets = error.meta?.target as string[] | undefined;
        const campo = targets ? targets[0] : 'Dado';

        return NextResponse.json(
          { erro: `${campo} já cadastrado no sistema` },
          { status: 409 }
        );
      }
    }

    console.error('Erro ao criar cadastro:', error);
    return NextResponse.json(
      { erro: 'Erro interno ao processar cadastro' },
      { status: 500 }
    );
  }
}