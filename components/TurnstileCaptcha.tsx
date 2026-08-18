'use client';

import { useEffect, useId, useRef } from 'react';
import Script from 'next/script';
import { ShieldCheck } from 'lucide-react';

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void; 'expired-callback': () => void }) => void;
    };
  }
}

export default function TurnstileCaptcha({ onVerify }: { onVerify: (token: string | null) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);
  const id = useId().replace(/:/g, '');
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    function renderCaptcha() {
      if (!siteKey || !window.turnstile || !containerRef.current || renderedRef.current) return;
      renderedRef.current = true;
      window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onVerify(token),
        'expired-callback': () => onVerify(null),
      });
    }

    renderCaptcha();
    window.addEventListener('turnstile-ready', renderCaptcha);
    return () => window.removeEventListener('turnstile-ready', renderCaptcha);
  }, [onVerify, siteKey]);

  if (!siteKey) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        Protecao humana sera ativada na publicacao.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <Script
        id={`turnstile-${id}`}
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => window.dispatchEvent(new Event('turnstile-ready'))}
      />
      <div ref={containerRef} />
    </div>
  );
}
