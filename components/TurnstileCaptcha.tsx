'use client';

import { useEffect, useId, useRef } from 'react';
import Script from 'next/script';
import { ShieldCheck } from 'lucide-react';

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: { sitekey: string; theme?: 'auto'; size?: 'flexible'; callback: (token: string) => void; 'expired-callback': () => void; 'error-callback': () => void }) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export default function TurnstileCaptcha({ onVerify, resetKey = 0 }: { onVerify: (token: string | null) => void; resetKey?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);
  const widgetIdRef = useRef<string | null>(null);
  const id = useId().replace(/:/g, '');
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    function renderCaptcha() {
      if (!siteKey || !window.turnstile || !containerRef.current || renderedRef.current) return;
      renderedRef.current = true;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'auto',
        size: 'flexible',
        callback: (token) => onVerify(token),
        'expired-callback': () => onVerify(null),
        'error-callback': () => onVerify(null),
      });
    }

    renderCaptcha();
    window.addEventListener('turnstile-ready', renderCaptcha);
    return () => window.removeEventListener('turnstile-ready', renderCaptcha);
  }, [onVerify, siteKey]);

  useEffect(() => {
    if (resetKey > 0 && widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      onVerify(null);
    }
  }, [onVerify, resetKey]);

  if (!siteKey) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        Proteção humana será ativada na publicação.
      </div>
    );
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
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
