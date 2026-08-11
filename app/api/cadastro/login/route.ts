import { NextResponse } from 'next/server';

export async function POST() {
  // Senhas do Firebase só podem ser verificadas pelo SDK de cliente. Emitir um
  // token administrativo para um e-mail conhecido permitiria acesso indevido.
  return NextResponse.json(
    { erro: 'Use a autenticação do Firebase no cliente para entrar.' },
    { status: 410 }
  );
}
