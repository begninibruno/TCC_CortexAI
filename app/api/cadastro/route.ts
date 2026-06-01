// app/api/cadastro/route.ts

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
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

    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // TODO: salvar no Firebase futuramente

    return NextResponse.json(
      {
        sucesso: true,
        mensagem: 'Cadastro realizado com sucesso',
        usuario: {
          empresa,
          responsavel,
          email,
          telefone,
          cpfCnpj: cpfCnpjLimpo,
          senhaHash: senhaCriptografada,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar cadastro:', error);

    return NextResponse.json(
      {
        erro: 'Erro interno ao processar cadastro',
      },
      { status: 500 }
    );
  }
}