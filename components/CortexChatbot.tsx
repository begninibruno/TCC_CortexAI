'use client';

import Image from 'next/image';
import { ExternalLink, MessageCircle, X } from 'lucide-react';
import { useState } from 'react';

const WHATSAPP_URL = 'https://wa.me/5519987369400?text=Ol%C3%A1%21%20Conheci%20o%20CortexAI%20pelo%20site%20e%20gostaria%20de%20falar%20com%20um%20vendedor.';

const QUESTIONS = [
  {
    question: 'O que o CortexAI faz?',
    answer: 'O CortexAI reúne produtos, estoque, clientes, vendas e relatórios em um só painel. Nos planos com dispositivo, ele também leva a inteligência para o atendimento físico da loja.',
  },
  {
    question: 'Preciso comprar o aparelho?',
    answer: 'Não para usar a gestão online. O dispositivo faz parte dos planos indicados para quem também deseja atendimento inteligente dentro da loja.',
  },
  {
    question: 'Como começo a usar?',
    answer: 'Crie sua conta, escolha o plano e cadastre ou importe seus produtos. Depois disso, o painel já fica pronto para acompanhar a operação.',
  },
  {
    question: 'Consigo importar meu estoque?',
    answer: 'Sim. A página de Produtos aceita arquivos Excel e CSV exportados de PDVs, ERPs, lojas virtuais e outros sistemas.',
  },
  {
    question: 'Meus dados ficam separados?',
    answer: 'Sim. Cada empresa acessa sua própria área autenticada, com dados organizados separadamente no banco.',
  },
] as const;

type Message = { id: number; role: 'bot' | 'user'; text: string };

const INITIAL_MESSAGE: Message = {
  id: 0,
  role: 'bot',
  text: 'Olá! Eu sou o assistente do CortexAI. Escolha uma dúvida abaixo e eu explico rapidinho.',
};

export default function CortexChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);

  function ask(question: (typeof QUESTIONS)[number]) {
    setMessages((current) => {
      const nextId = current.length;
      return [
        ...current,
        { id: nextId, role: 'user', text: question.question },
        { id: nextId + 1, role: 'bot', text: question.answer },
      ];
    });
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {open && (
        <section
          id="cortex-chat-panel"
          role="dialog"
          aria-label="Ajuda do CortexAI"
          className="mb-3 flex max-h-[min(38rem,calc(100dvh-7rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900"
        >
          <header className="flex items-center justify-between bg-slate-950 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                <Image src="/logo.png" alt="" width={31} height={31} />
              </span>
              <div>
                <p className="font-black">Cortex responde</p>
                <p className="flex items-center gap-1.5 text-xs text-slate-300"><span className="h-2 w-2 rounded-full bg-emerald-400" />Ajuda rápida online</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl p-2 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Fechar atendimento">
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4 dark:bg-slate-950/60" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${message.role === 'user' ? 'rounded-br-md bg-blue-600 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
                  {message.text}
                </p>
              </div>
            ))}

            <div className="pt-1">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Perguntas comuns</p>
              <div className="flex flex-wrap gap-2">
                {QUESTIONS.map((item) => (
                  <button key={item.question} type="button" onClick={() => ask(item)} className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-left text-xs font-semibold text-blue-700 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-900 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-blue-950/40">
                    {item.question}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <footer className="border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-2 text-center text-xs text-slate-500 dark:text-slate-400">Ainda precisa de ajuda?</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#16a34a] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#15803d]">
              <MessageCircle className="h-4 w-4" /> Conversar com um vendedor <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </footer>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="cortex-chat-panel"
        className="group relative ml-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-blue-300 bg-slate-950 shadow-xl shadow-blue-600/25 hover:-translate-y-0.5 hover:border-blue-400"
        aria-label={open ? 'Fechar ajuda' : 'Abrir ajuda do CortexAI'}
      >
        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-950" />
        {open ? <X className="h-6 w-6 text-white" /> : <Image src="/logo.png" alt="" width={40} height={40} className="transition-transform group-hover:scale-105" />}
      </button>
    </div>
  );
}
