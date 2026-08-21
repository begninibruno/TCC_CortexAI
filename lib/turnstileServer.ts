import 'server-only';

type TurnstileResult = { success: boolean; configured: boolean };

export async function verifyTurnstileToken(token: string | null, remoteIp?: string | null): Promise<TurnstileResult> {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const configured = Boolean(siteKey && secret);
  if (!configured) return { success: process.env.NODE_ENV !== 'production', configured: false };
  if (!token || token.length > 2048) return { success: false, configured: true };

  try {
    const payload = new URLSearchParams({ secret: secret!, response: token });
    if (remoteIp) payload.set('remoteip', remoteIp.split(',')[0].trim());
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload,
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });
    if (!response.ok) return { success: false, configured: true };
    const result = await response.json() as { success?: boolean };
    return { success: result.success === true, configured: true };
  } catch {
    return { success: false, configured: true };
  }
}
