// app/api/cadastro/route.ts
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { empresa, responsavel, email, telefone, cpfCnpj, senha } = body;

    // Validação básica
    if (!empresa || !responsavel || !email || !senha) {
      return NextResponse.json(
        { erro: 'Campos obrigatórios faltando' },
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
        cpf_cnpj: cpfCnpj?.replace(/\D/g, '') || '',
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
  } 
  
    catch (error: any) {
    // Tratamento específico de erros do Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
  if (error.code === 'P2002') {
    // Pegamos o campo que falhou. Se não houver, usamos 'Campo' como fallback
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