import {
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  ChevronDown,
  CircleCheck,
  FileSpreadsheet,
  MessageCircle,
  PackageSearch,
  Sparkles,
  Store,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import CortexChatbot from '@/components/CortexChatbot';
import ThemeToggle from '@/components/ThemeToggle';

type PriceCardProps = {
  id: string;
  tier: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
};

const benefits = [
  { icon: Boxes, title: 'Operação centralizada', description: 'Produtos, estoque, vendas e clientes no mesmo fluxo.' },
  { icon: BarChart3, title: 'Decisões mais claras', description: 'Relatórios diretos para entender o que está acontecendo.' },
  { icon: Sparkles, title: 'Atendimento conectado', description: 'A inteligência do painel também pode chegar à loja física.' },
];

const steps = [
  {
    number: '01',
    title: 'Crie o espaço da sua loja',
    description: 'Faça o cadastro, escolha o plano e deixe a área da empresa pronta em poucos minutos.',
  },
  {
    number: '02',
    title: 'Traga seus produtos',
    description: 'Cadastre manualmente ou importe uma planilha do seu PDV, ERP ou loja virtual.',
  },
  {
    number: '03',
    title: 'Comece a operar',
    description: 'Registre vendas, acompanhe o estoque e conecte o dispositivo Cortex quando fizer parte do plano.',
  },
];

const plans = [
  {
    id: 'cortexmini',
    tier: 'CortexMini',
    price: '59,90',
    description: 'Para organizar a operação e começar com o essencial.',
    features: ['Produtos e estoque', 'Gestão de clientes', 'Relatórios mensais'],
  },
  {
    id: 'cortex',
    tier: 'Cortex',
    price: '99,90',
    description: 'Gestão completa com inteligência no atendimento físico.',
    featured: true,
    features: ['Tudo do CortexMini', '1 dispositivo MiniCortex AI', 'IA personalizada', 'Suporte especializado'],
  },
  {
    id: 'cortexpro',
    tier: 'CortexPro',
    price: '199,90',
    description: 'Mais capacidade para operações que precisam crescer.',
    features: ['Tudo do Cortex', '1 dispositivo Cortex AI', 'API de dados', 'Suporte prioritário'],
  },
];

const faqs = [
  {
    question: 'O CortexAI funciona sem o dispositivo físico?',
    answer: 'Sim. Produtos, estoque, clientes, vendas e relatórios funcionam pelo painel online. O dispositivo complementa a experiência nos planos em que está incluído.',
  },
  {
    question: 'Consigo trazer os produtos de outro sistema?',
    answer: 'Sim. Você pode importar planilhas Excel ou CSV exportadas de PDVs, ERPs, sites e outros sistemas, revisando os dados antes de salvar.',
  },
  {
    question: 'Preciso de internet para utilizar?',
    answer: 'Sim. O painel e os recursos inteligentes precisam de uma conexão estável para sincronizar e proteger os dados da empresa.',
  },
  {
    question: 'Posso mudar de plano depois?',
    answer: 'Sim. A equipe comercial pode orientar a mudança conforme a necessidade e o momento da sua operação.',
  },
];

const WHATSAPP_URL = 'https://wa.me/5519987369400?text=Ol%C3%A1%21%20Conheci%20o%20CortexAI%20pelo%20site%20e%20gostaria%20de%20falar%20com%20um%20vendedor.';

export default function LandingPage() {
  return (
    <div className="cortex-landing min-h-screen overflow-hidden text-slate-950 selection:bg-blue-200 dark:text-white">
      <nav className="fixed top-0 z-40 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85" aria-label="Navegação principal">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="CortexAI — página inicial">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-900 dark:bg-slate-900 sm:h-12 sm:w-12">
              <Image src="/logo.png" alt="" width={32} height={32} priority />
            </span>
            <span>
              <span className="block text-base font-black tracking-tight text-slate-950 dark:text-white">CortexAI</span>
              <span className="hidden text-[9px] font-bold uppercase tracking-[0.25em] text-blue-600 sm:block dark:text-blue-400">Inteligência para o varejo</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-semibold text-slate-600 lg:flex dark:text-slate-300">
            <a href="#recursos" className="hover:text-blue-600 dark:hover:text-blue-300">Recursos</a>
            <a href="#como-funciona" className="hover:text-blue-600 dark:hover:text-blue-300">Como funciona</a>
            <a href="#planos" className="hover:text-blue-600 dark:hover:text-blue-300">Planos</a>
            <a href="#duvidas" className="hover:text-blue-600 dark:hover:text-blue-300">Dúvidas</a>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link href="/Login" className="hidden text-sm font-bold text-slate-700 hover:text-blue-600 sm:block dark:text-slate-200 dark:hover:text-blue-300">Entrar</Link>
            <Link href="/Cadastro" className="rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 sm:px-5">
              <span className="sm:hidden">Começar</span><span className="hidden sm:inline">Criar minha conta</span>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative px-4 pb-20 pt-32 sm:px-6 sm:pb-28 sm:pt-40">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,0.96fr)_minmax(30rem,1.04fr)] lg:gap-16">
            <div className="relative z-10">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                <span className="h-2 w-2 rounded-full bg-blue-600" /> O sistema nervoso da sua loja
              </span>
              <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[4.7rem] dark:text-white">
                Sua loja ganha <span className="text-blue-600 dark:text-blue-400">clareza.</span> E uma inteligência própria.
              </h1>
              <p className="mt-7 max-w-xl text-lg font-medium leading-8 text-slate-600 dark:text-slate-300">
                O CortexAI conecta gestão, estoque, vendas, clientes e atendimento físico para sua empresa trabalhar como um único organismo.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/Cadastro" className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 text-base font-black text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700">
                  Começar agora <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <a href="#como-funciona" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-7 py-4 text-base font-black text-slate-800 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800">
                  Ver como funciona
                </a>
              </div>

              <div className="mt-9 grid gap-3 sm:grid-cols-3">
                {benefits.map(({ icon: Icon, title, description }) => (
                  <article key={title} className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/85">
                    <Icon className="mb-3 h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-sm font-black text-slate-950 dark:text-white">{title}</h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[38rem] lg:max-w-none">
              <div className="cortex-device-grid relative min-h-[34rem] overflow-hidden rounded-[3rem] border-[10px] border-slate-800 bg-[#050b1e] p-6 shadow-[0_35px_90px_rgba(15,23,42,0.28)] sm:min-h-[40rem] sm:p-9 dark:border-slate-700">
                <div className="relative z-10 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"><Image src="/logo.png" alt="" width={25} height={25} /></span>
                    <div><p className="text-xs font-black uppercase tracking-[0.2em]">Cortex Core</p><p className="text-[10px] text-slate-400">Conectado à sua operação</p></div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-bold text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Online</span>
                </div>

                <div className="relative z-10 mx-auto mt-12 flex h-[22rem] w-[15rem] flex-col items-center justify-center overflow-hidden rounded-[2.2rem] border-4 border-white/15 bg-gradient-to-b from-white/10 to-white/[0.04] p-6 text-center shadow-2xl sm:mt-16 sm:h-[25rem] sm:w-[17rem]">
                  <div className="absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-blue-400/25 bg-blue-500/10 shadow-[0_0_70px_rgba(37,99,235,0.34)]">
                    <span className="absolute h-20 w-20 animate-ping rounded-full border border-blue-400/20" />
                    <Image src="/logo.png" alt="Cérebro digital do CortexAI" width={76} height={76} className="relative z-10" />
                  </div>
                  <p className="mt-7 text-[11px] font-black uppercase tracking-[0.28em] text-blue-300">Ouvindo sua loja</p>
                  <div className="mt-5 flex h-8 items-center gap-1">
                    {[3, 6, 9, 5, 12, 8, 4, 10, 6, 3].map((height, index) => <span key={`${height}-${index}`} className="w-1 rounded-full bg-blue-400" style={{ height: `${height * 2}px` }} />)}
                  </div>
                </div>

                <div className="absolute bottom-7 left-5 z-20 max-w-52 rounded-2xl border border-white/10 bg-white/10 p-3.5 text-white shadow-xl backdrop-blur-xl sm:bottom-10 sm:left-8">
                  <p className="flex items-center gap-2 text-xs font-bold"><PackageSearch className="h-4 w-4 text-blue-300" /> Estoque sincronizado</p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-400">12 produtos precisam de atenção.</p>
                </div>
                <div className="absolute right-5 top-24 z-20 max-w-48 rounded-2xl border border-white/10 bg-white/10 p-3.5 text-white shadow-xl backdrop-blur-xl sm:right-8 sm:top-28">
                  <p className="flex items-center gap-2 text-xs font-bold"><Zap className="h-4 w-4 text-amber-300" /> Resposta imediata</p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-400">Dados da loja viram contexto.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200/80 bg-white/75 px-4 py-5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/70">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-bold text-slate-500 sm:justify-between dark:text-slate-400">
            {['Produtos organizados', 'Estoque atualizado', 'Vendas registradas', 'Clientes próximos', 'Relatórios objetivos'].map((item) => <span key={item} className="flex items-center gap-2"><CircleCheck className="h-4 w-4 text-blue-600" />{item}</span>)}
          </div>
        </section>

        <section id="recursos" className="px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">Uma visão completa</span>
              <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">Um painel para enxergar a loja inteira.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">Menos ferramentas soltas, menos decisões no escuro. O Cortex conecta a rotina e apresenta o que merece atenção.</p>
            </div>

            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              <article className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-7 text-white lg:col-span-2 dark:border-slate-700">
                <div className="relative z-10 max-w-md">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300"><Store className="h-5 w-5" /></span>
                  <h3 className="mt-6 text-2xl font-black">Tudo que acontece, em um só lugar</h3>
                  <p className="mt-3 leading-7 text-slate-300">Cadastros e movimentações compartilham o mesmo contexto. Uma venda atualiza o estoque e alimenta os relatórios automaticamente.</p>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {['Cadastro de produtos e categorias', 'Controle de estoque e reposição', 'Vendas e formas de pagamento', 'Clientes e histórico de compras'].map((item) => <div key={item} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-200"><Check className="h-4 w-4 text-blue-300" />{item}</div>)}
                </div>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-7 dark:border-slate-700 dark:bg-slate-900">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300"><FileSpreadsheet className="h-5 w-5" /></span>
                <h3 className="mt-6 text-xl font-black">Importe sem começar do zero</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">Traga planilhas do PDV, ERP ou site. O Cortex reconhece colunas, categorias, preços e estoque antes de salvar.</p>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-7 dark:border-slate-700 dark:bg-slate-900">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"><BarChart3 className="h-5 w-5" /></span>
                <h3 className="mt-6 text-xl font-black">Relatórios que falam claro</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">Veja total vendido, custos, gastos, saldo estimado e produtos que mais geram resultado.</p>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-blue-600 p-7 text-white lg:col-span-2">
                <div className="grid items-center gap-7 sm:grid-cols-[auto_1fr]">
                  <span className="flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-white/15"><Image src="/logo.png" alt="" width={54} height={54} /></span>
                  <div><h3 className="text-2xl font-black">A mesma inteligência no atendimento físico</h3><p className="mt-2 leading-7 text-blue-100">Nos planos com dispositivo, as informações do negócio ajudam o Cortex a responder com mais contexto dentro da loja.</p></div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="border-y border-slate-200/80 bg-white/70 px-4 py-24 sm:px-6 sm:py-32 dark:border-slate-800 dark:bg-slate-950/60">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">Sem complicação</span>
              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Instalação em 3 passos</h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">Você começa pelo software e conecta o atendimento físico quando estiver pronto.</p>
            </div>
            <div className="relative mt-14 grid gap-5 md:grid-cols-3">
              <div className="absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent md:block dark:via-blue-800" />
              {steps.map((step) => (
                <article key={step.number} className="relative rounded-[2rem] border border-slate-200 bg-white p-7 dark:border-slate-700 dark:bg-slate-900">
                  <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-lg font-black text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300">{step.number}</span>
                  <h3 className="mt-6 text-xl font-black">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="planos" className="px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">Escolha seu Cortex</span>
              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Um plano para cada momento da loja.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">Comece organizando a operação e evolua para o atendimento inteligente quando fizer sentido.</p>
            </div>
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => <PriceCard key={plan.id} {...plan} />)}
            </div>
          </div>
        </section>

        <section id="duvidas" className="border-y border-slate-200/80 bg-white/70 px-4 py-24 sm:px-6 dark:border-slate-800 dark:bg-slate-950/60">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">Dúvidas frequentes</span>
              <h2 className="mt-4 text-4xl font-black tracking-tight">Antes de começar, talvez você queira saber.</h2>
              <p className="mt-5 leading-7 text-slate-600 dark:text-slate-300">O cérebro no canto da tela também responde às perguntas mais comuns e conecta você a um vendedor.</p>
              <div className="mt-7 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"><Image src="/logo.png" alt="" width={38} height={38} /><div><p className="text-sm font-black">Cortex responde</p><p className="text-xs text-slate-500 dark:text-slate-400">Ajuda rápida durante sua visita.</p></div></div>
            </div>
            <div className="space-y-3">
              {faqs.map((faq) => <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />)}
            </div>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-slate-950 px-6 py-12 text-center text-white shadow-2xl sm:px-12 sm:py-16">
            <Image src="/logo.png" alt="" width={58} height={58} className="mx-auto" />
            <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">Dê uma inteligência própria para a sua operação.</h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">Crie sua conta ou fale com quem pode ajudar a escolher o melhor começo.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/Cadastro" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 font-black text-white hover:bg-blue-500">Criar minha conta <ArrowRight className="h-5 w-5" /></Link>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-7 py-4 font-black text-white hover:bg-white/15"><MessageCircle className="h-5 w-5" />Falar com um vendedor</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/70 px-4 py-10 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3"><Image src="/logo.png" alt="" width={34} height={34} /><div><p className="font-black">CortexAI</p><p className="text-xs text-slate-500 dark:text-slate-400">Gestão e inteligência para o varejo.</p></div></div>
          <p className="text-xs text-slate-500 dark:text-slate-400">© 2026 CortexAI. Todos os direitos reservados.</p>
        </div>
      </footer>

      <CortexChatbot />
    </div>
  );
}

function PriceCard({ id, tier, price, description, features, featured = false }: PriceCardProps) {
  return (
    <article className={`relative flex h-full flex-col rounded-[2rem] border p-7 ${featured ? 'border-blue-600 bg-blue-600 text-white shadow-2xl shadow-blue-600/20 lg:-translate-y-3' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'}`}>
      {featured && <span className="absolute right-5 top-5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider">Mais escolhido</span>}
      <h3 className="text-xl font-black">{tier}</h3>
      <p className={`mt-2 min-h-12 text-sm leading-6 ${featured ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>{description}</p>
      <div className="mt-6"><span className="text-4xl font-black">R$ {price}</span><span className={`text-sm font-bold ${featured ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>/mês</span></div>
      <div className={`my-6 h-px ${featured ? 'bg-white/15' : 'bg-slate-200 dark:bg-slate-700'}`} />
      <ul className="flex-1 space-y-4">
        {features.map((feature) => <li key={feature} className={`flex items-start gap-2 text-sm font-medium ${featured ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}><Check className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? 'text-white' : 'text-blue-600'}`} />{feature}</li>)}
      </ul>
      <Link href={`/Cadastro?plano=${id}`} className={`mt-8 w-full rounded-xl py-3.5 text-center text-sm font-black ${featured ? 'bg-white text-blue-700 hover:bg-blue-50' : 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'}`}>Escolher {tier}</Link>
    </article>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:open:border-blue-800">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <h3 className="font-bold text-slate-950 dark:text-white">{question}</h3>
        <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">{answer}</p>
    </details>
  );
}
