import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
<<<<<<< HEAD
=======
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
>>>>>>> edd634e4ac69bbbd2bd14cada653753f419eb02f

export async function POST(req: NextRequest) {
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

<<<<<<< HEAD
    return NextResponse.json({
      mensagem: 'Cadastro realizado com sucesso',
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome_responsavel,
        email: novoUsuario.email
      }
    });
=======
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
>>>>>>> edd634e4ac69bbbd2bd14cada653753f419eb02f

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}