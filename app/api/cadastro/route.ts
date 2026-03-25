import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

const tipoNegocioMap: Record<string, any> = {
  'Varejo - Loja física': 'LOJA_FISICA',
  'Varejo - Online': 'ECOMMERCE',
  'Alimentação': 'ALIMENTACAO',
  'Serviços': 'SERVICOS',
  'Indústria': 'INDUSTRIA',
  'Profissional Liberal': 'PROFISSIONAL_LIBERAL'
};

const faturamentoMap: Record<string, any> = {
  'Até R$ 5.000/mês': 'ATE_5K',
  'R$ 5.000 a R$ 15.000/mês': 'DE_5K_A_15K',
  'R$ 15.000 a R$ 30.000/mês': 'DE_15K_A_30K',
  'Acima de R$ 30.000/mês': 'ACIMA_30K'
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      empresa,
      responsavel,
      email,
      telefone,
      cpfCnpj,
      tipoNegocio,
      faturamento,
      senha
    } = body;

    if (!empresa || !responsavel || !email || !cpfCnpj || !senha) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    const tipo_negocio = tipoNegocio
      ? tipoNegocioMap[tipoNegocio]
      : 'LOJA_FISICA';
    const faturamento_enum = faturamento
      ? faturamentoMap[faturamento]
      : 'ATE_5K';

    if (!tipo_negocio) {
      return NextResponse.json(
        { error: 'Tipo de negócio inválido' },
        { status: 400 }
      );
    }

    const novoCadastro = await prisma.cortexAI.create({
      data: {
        nome_empresa: empresa,
        nome_responsavel: responsavel,
        cpf_cnpj: cpfCnpj,
        email,
        telefone: telefone || null,
        tipo_negocio: tipo_negocio,
        faturamento: faturamento_enum,
        senha
      }
    });

    return NextResponse.json(novoCadastro, { status: 201 });

  } catch (error: any) {
    console.error('Erro API cadastro:', error);

    return NextResponse.json(
      { error: 'Erro ao cadastrar usuário' },
      { status: 500 }
    );
  }
}