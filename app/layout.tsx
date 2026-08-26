
import "./globals.css";
import type { Metadata, Viewport } from 'next';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: {
    default: 'CortexAI — Gestão inteligente para o varejo',
    template: '%s | CortexAI',
  },
  description: 'Gestão de produtos, estoque, clientes, vendas e atendimento físico inteligente em um só lugar.',
  applicationName: 'CortexAI',
  icons: { icon: '/logo.png', apple: '/logo.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('theme');const d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch{}`,
          }}
        />
      </head>
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

