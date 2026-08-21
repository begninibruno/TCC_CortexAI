import {
  ArrowRight,
  Check,
  ChevronDown,
  Cpu,
  MessageSquare,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

type StepCardProps = {
  number: string;
  title: string;
  desc: string;
};

type PriceCardProps = {
  id: string;
  tier: string;
  price: string;
  features: string[];
  featured?: boolean;
};

type FaqItemProps = {
  q: string;
  a: string;
};

const benefits = [
  { icon: Cpu, title: 'IA local', description: 'Atendimento rápido e inteligente.' },
  { icon: ShieldCheck, title: 'Segurança', description: 'Conectividade e controle de acesso.' },
  { icon: Zap, title: 'Performance', description: 'Resposta imediata para clientes.' },
];

const steps = [
  {
    number: '01',
    title: 'Plug & Play',
    desc: 'Conecte o dispositivo na tomada e no Wi-Fi da sua loja.',
  },
  {
    number: '02',
    title: 'Alimente a IA',
    desc: 'Suba seu catálogo de produtos e informações da loja no software.',
  },
  {
    number: '03',
    title: 'Venda mais',
    desc: 'Seu assistente começa a interagir com você em tempo real.',
  },
];

const plans = [
  {
    id: 'cortexmini',
    tier: 'CortexMini',
    price: '59,90',
    features: ['Controle de estoque', 'Gestão de clientes', 'Relatórios mensais'],
  },
  {
    id: 'cortex',
    tier: 'Cortex',
    price: '99,90',
    featured: true,
    features: ['Tudo do CortexMini', '1 dispositivo MiniCortex AI', 'IA personalizada', 'Suporte'],
  },
  {
    id: 'cortexpro',
    tier: 'CortexPro',
    price: '199,90',
    features: ['Tudo do Cortex', '1 dispositivo Cortex AI', 'API de dados', 'Suporte VIP'],
  },
];

const faqs = [
  {
    q: 'Preciso de internet para funcionar?',
    a: 'Sim, o assistente utiliza processamento em nuvem e precisa de uma conexão Wi-Fi estável.',
  },
  {
    q: 'A IA aprende sozinha sobre minha loja?',
    a: 'Você fornece a base de dados inicial e a IA otimiza as respostas conforme o seu comando.',
  },
  {
    q: 'O hardware tem garantia?',
    a: 'Sim, fornecemos garantia total e substituição imediata nos planos Cortex e CortexPro.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-950 selection:bg-blue-100 dark:from-slate-950 dark:via-slate-900 dark:to-[#020617] dark:text-white">
      <nav className="fixed top-0 z-40 w-full border-b border-slate-200/70 bg-white/90 text-slate-950 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 dark:text-white" aria-label="Navegação principal">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="CortexAI — página inicial">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:h-12 sm:w-12">
              <Image src="/logo.png" alt="" width={30} height={30} priority />
            </span>
            <span className="truncate text-base font-extrabold tracking-tight text-slate-800 dark:text-white sm:text-sm sm:uppercase sm:tracking-[0.28em]">CortexAI</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-bold text-slate-600 lg:flex dark:text-slate-300">
            <a href="#como-funciona" className="transition-colors hover:text-blue-500 dark:hover:text-blue-300">
              Como Funciona
            </a>
            <a href="#planos" className="transition-colors hover:text-blue-500 dark:hover:text-blue-300">
              Planos
            </a>
            <a href="#sobre" className="transition-colors hover:text-blue-500 dark:hover:text-blue-300">
              Sobre Nós
            </a>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/Login"
              className="hidden text-sm font-bold text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-300 sm:block"
            >
              Entrar
            </Link>
            <Link
              href="/Cadastro"
              className="rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 sm:px-5"
            >
              <span className="sm:hidden">Começar</span><span className="hidden sm:inline">Começar agora</span>
            </Link>
          </div>
        </div>
      </nav>

      <section className="px-4 pb-20 pt-32 sm:px-6 sm:pt-40">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="mb-6 inline-block rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-blue-600 dark:bg-blue-400/10 dark:text-blue-300">
              O Futuro do Atendimento Físico
            </span>
            <h1 className="mb-6 text-5xl font-black leading-[1.1] tracking-tight text-slate-950 md:text-7xl dark:text-white">
              Sua loja agora tem uma <span className="text-blue-600 dark:text-blue-400">Voz Inteligente.</span>
            </h1>
            <p className="mb-8 max-w-lg text-lg font-medium leading-relaxed text-slate-600 dark:text-slate-300">
              Um assistente virtual físico que obedece os seus comandos e transforma a experiência do cliente.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/Cadastro"
                className="group flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-8 py-4 text-lg font-black text-white shadow-xl shadow-blue-500/20 transition-all hover:bg-blue-600"
              >
                Começar agora <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#como-funciona"
                className="rounded-2xl bg-slate-950 px-8 py-4 text-lg font-black text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-900 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
              >
                Ver como funciona
              </a>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {benefits.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                    <Icon className="mb-2 text-blue-500" size={20} />
                    <h3 className="text-sm font-black text-slate-950 dark:text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[3rem] border-8 border-slate-200/10 bg-gradient-to-br from-slate-900 via-slate-950 to-[#020617] shadow-2xl dark:border-white/10">
              <div className="flex h-80 w-48 flex-col items-center justify-center rounded-3xl border-4 border-white/15 bg-white/10 p-6 text-center shadow-2xl dark:border-slate-700 dark:bg-slate-950/80">
                <div className="mb-4 h-12 w-12 animate-pulse rounded-full bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.6)]"></div>
                <div className="w-full space-y-2">
                  <div className="mx-auto h-2 w-3/4 rounded bg-white/20"></div>
                  <div className="mx-auto h-2 w-1/2 rounded bg-white/20"></div>
                </div>
              </div>
              <div className="absolute right-10 top-10 rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl">
                <MessageSquare className="text-blue-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="px-6 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-16 text-center text-3xl font-black text-slate-950 dark:text-white">
            Instalação em 3 Passos
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <StepCard key={step.number} number={step.number} title={step.title} desc={step.desc} />
            ))}
          </div>
        </div>
      </section>

      <section id="sobre" className="px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Nossa Missão
          </h2>
          <p className="text-3xl font-bold leading-tight italic text-slate-700/90 dark:text-white/80">
            “Queremos democratizar a inteligência artificial de ponta para o varejo físico, transformando cada loja em um ambiente interativo e eficiente.”
          </p>
          <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="rounded-3xl border border-slate-200/70 bg-slate-100/80 p-8 text-center dark:border-slate-700 dark:bg-slate-900/80">
              <p className="text-4xl font-black text-slate-950 dark:text-white">500+</p>
              <p className="mt-2 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Lojas Ativas</p>
            </div>
            <div className="rounded-3xl border border-slate-200/70 bg-slate-100/80 p-8 text-center dark:border-slate-700 dark:bg-slate-900/80">
              <p className="text-4xl font-black text-slate-950 dark:text-white">1M+</p>
              <p className="mt-2 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Interações/mês</p>
            </div>
            <div className="rounded-3xl border border-slate-200/70 bg-slate-100/80 p-8 text-center dark:border-slate-700 dark:bg-slate-900/80">
              <p className="text-4xl font-black text-slate-950 dark:text-white">98%</p>
              <p className="mt-2 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Satisfação</p>
            </div>
            <div className="rounded-3xl border border-slate-200/70 bg-slate-100/80 p-8 text-center dark:border-slate-700 dark:bg-slate-900/80">
              <p className="text-4xl font-black text-slate-950 dark:text-white">24/7</p>
              <p className="mt-2 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Suporte</p>
            </div>
          </div>
        </div>
      </section>

      <section id="planos" className="px-6 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black text-slate-950 dark:text-white">
              Planos que cabem no seu negócio
            </h2>
            <p className="text-slate-600 dark:text-slate-300">Escolha o nível de inteligência da sua loja.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <PriceCard
                key={plan.tier}
                id={plan.id}
                tier={plan.tier}
                price={plan.price}
                featured={plan.featured}
                features={plan.features}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-black text-slate-950 dark:text-white">
            Dúvidas Frequentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200/60 py-12 text-center dark:border-white/10">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          © 2026 CORTEX.AI - Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}

function StepCard({ number, title, desc }: StepCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-slate-100/80 p-8 shadow-sm transition-colors hover:border-blue-400/30 dark:border-slate-700 dark:bg-slate-900/80">
      <span className="mb-4 block text-4xl font-black text-slate-400 dark:text-white/20">{number}</span>
      <h3 className="mb-2 text-xl font-black text-slate-950 dark:text-white">{title}</h3>
      <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">{desc}</p>
    </div>
  );
}

function PriceCard({ id, tier, price, features, featured = false }: PriceCardProps) {
  return (
    <div
      className={`flex h-full flex-col rounded-[2rem] border p-8 transition-all ${
        featured
          ? 'border-blue-500 bg-blue-600 shadow-2xl shadow-blue-500/20 md:scale-[1.03]'
          : 'border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900'
      }`}
    >
      <h3 className={`mb-2 text-xl font-black ${featured ? 'text-white' : 'text-slate-950 dark:text-white'}`}>
        {tier}
      </h3>
      <div className="mb-6">
        <span className={`text-4xl font-black ${featured ? 'text-white' : 'text-slate-950 dark:text-white'}`}>
          R${price}
        </span>
        {price !== 'Sob Consulta' && (
          <span className={`text-sm font-bold ${featured ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
            /mês
          </span>
        )}
      </div>
      <ul className="mb-8 flex-1 space-y-4">
        {features.map((feature) => (
          <li
            key={feature}
            className={`flex items-center gap-2 text-sm font-medium ${featured ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'}`}
          >
            <Check size={16} className={featured ? 'text-white' : 'text-blue-400'} /> {feature}
          </li>
        ))}
      </ul>
      <Link
        href={`/Cadastro?plano=${id}`}
        className={`w-full rounded-xl py-4 text-center text-xs font-black uppercase tracking-widest transition-all ${
          featured
            ? 'bg-white text-blue-600 hover:bg-blue-50'
            : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
        }`}
      >
        Escolher plano
      </Link>
    </div>
  );
}

function FaqItem({ q, a }: FaqItemProps) {
  return (
    <details className="group rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm transition-all open:border-blue-300 dark:border-slate-700 dark:bg-slate-900/80 dark:open:border-blue-800">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <h4 className="font-bold text-slate-950 dark:text-white">{q}</h4>
        <ChevronDown size={18} className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      <p className="mt-4 text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">{a}</p>
    </details>
  );
}
