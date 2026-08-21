import { NextRequest, NextResponse } from 'next/server';
import { verifyTurnstileToken } from '@/lib/turnstileServer';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const captchaToken = typeof body?.captchaToken === 'string' ? body.captchaToken : null;
    if (!emailPattern.test(email)) return NextResponse.json({ erro: 'E-mail inválido.' }, { status: 400 });

    const remoteIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for');
    const verification = await verifyTurnstileToken(captchaToken, remoteIp);
    if (!verification.configured && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ erro: 'A proteção humana precisa ser configurada antes de usar esta função.' }, { status: 503 });
    }
    if (!verification.success) {
      return NextResponse.json({ erro: 'A verificação humana expirou ou não foi confirmada. Tente novamente.' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
    if (!apiKey) return NextResponse.json({ erro: 'A recuperação de senha ainda não está configurada.' }, { status: 503 });
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestType: 'PASSWORD_RESET', email }),
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
    });

    if (!response.ok) {
      const result = await response.json().catch(() => null) as { error?: { message?: string } } | null;
      if (result?.error?.message === 'EMAIL_NOT_FOUND') {
        return NextResponse.json({ sucesso: true });
      }
      return NextResponse.json({ erro: 'Não foi possível solicitar o e-mail agora. Tente novamente mais tarde.' }, { status: 502 });
    }
    return NextResponse.json({ sucesso: true });
  } catch {
    return NextResponse.json({ erro: 'Não foi possível processar a solicitação.' }, { status: 500 });
  }
}
