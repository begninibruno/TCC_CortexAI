// app/api/cadastro/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs'; // NOVO

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { empresa, responsavel, email, telefone, cpfCnpj, senha } = body;

    // NOVO: Criptografar a senha (salt de 10 rounds)
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novo = await prisma.cadastro.create({
      data: {
        nome_empresa: empresa,
        nome_responsavel: responsavel,
        email,
        telefone,
        cpf_cnpj: cpfCnpj?.replace(/\D/g, '') || '', // Limpa máscara
        senha: senhaCriptografada, // Salva a criptografada
      },
    });

    return NextResponse.json({ sucesso: true }, { status: 201 });
  } catch (error: any) {
    // ... seu tratamento de erro P2002 permanece igual
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}