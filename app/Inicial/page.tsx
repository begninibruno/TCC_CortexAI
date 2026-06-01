
import { 
  Check, 
  ChevronDown, 
  Cpu, 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
} from 'lucide-react';
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1A2F] to-[#1C3B5E] text-white selection:bg-indigo-100">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 bg-[#0A1A2F]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-18 h-18 bg-blue- rounded-lg flex items-center justify-center">
              <img src="logo.png"/>
            </div>
            <span className="font-black text-xl tracking-tighter">Cortex AI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-white/80">
            <a href="#como-funciona" className="hover:text-blue-300 transition-colors">Como Funciona</a>
            <a href="#planos" className="hover:text-blue-300 transition-colors">Planos</a>
            <a href="#sobre" className="hover:text-blue-300 transition-colors">Sobre Nós</a>
          </div>

          <div className="flex items-center gap-4">
            
           <Link href="/Login">
            <span className="text-sm font-bold text-white/80 hover:text-blue-300 cursor-pointer">
            Entrar
            </span>
            </Link>
            <Link href="/Cadastro">
            <span className="bg-blue-500 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-600 hover:shadow-lg transition-all active:scale-95">
              Começar Agora
            </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-4 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              O Futuro do Atendimento Físico
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
              Sua loja agora tem uma <span className="text-blue-400">Voz Inteligente.</span>
            </h1>
            <p className="text-lg text-white/60 mb-8 max-w-lg leading-relaxed font-medium">
              Um assistente virtual físico que obedece os seus comandos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group">
                Ver Planos <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white/10 border-2 border-white/20 px-8 py-4 rounded-2xl font-black text-lg hover:bg-white/20 transition-all">
                Falar com consultor
              </button>
            </div>
          </div>
          <div className="relative">
            {/* Representação visual do totem/assistente */}
            <div className="aspect-square bg-gradient-to-br from-[#1A4B6D] to-[#0F2A40] rounded-[3rem] relative overflow-hidden border-8 border-white/10 shadow-2xl flex items-center justify-center">
              <div className="w-48 h-80 bg-white/10 rounded-3xl border-4 border-white/20 shadow-2xl flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full animate-pulse mb-4 shadow-[0_0_30px_rgba(59,130,246,0.6)]"></div>
                <div className="space-y-2 w-full">
                  <div className="h-2 bg-white/20 rounded w-3/4 mx-auto"></div>
                  <div className="h-2 bg-white/20 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
              {/* Floating tags */}
              <div className="absolute top-10 right-10 bg-white/10 p-4 rounded-2xl shadow-xl border border-white/20 animate-bounce">
                <MessageSquare className="text-blue-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- COMO FUNCIONA --- */}
      <section id="como-funciona" className="py-24 px-6">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center mb-16">Instalação em 3 Passos</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard number="01" title="Plug & Play" desc="Conecte o dispositivo na tomada e no Wi-Fi da sua loja." />
            <StepCard number="02" title="Alimente a IA" desc="Suba seu catálogo de produtos e informações da loja no software." />
            <StepCard number="03" title="Venda mais" desc="Seu assistente começa a interagir com você em tempo real." />
          </div>
        </div>
      </section>

      {/* --- SOBRE NÓS / MISSÃO --- */}
      <section id="sobre" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-4">Nossa Missão</h2>
          <p className="text-3xl font-bold leading-tight text-white/80 italic">
            "Queremos democratizar a inteligência artificial de ponta para o varejo físico, transformando cada loja em um ambiente interativo e eficiente."
          </p>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-black text-white">500+</p>
              <p className="text-xs font-bold text-white/40 uppercase mt-2">Lojas Ativas</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-white">1M+</p>
              <p className="text-xs font-bold text-white/40 uppercase mt-2">Interações/mês</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-white">98%</p>
              <p className="text-xs font-bold text-white/40 uppercase mt-2">Satisfação</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-white">24/7</p>
              <p className="text-xs font-bold text-white/40 uppercase mt-2">Suporte</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PLANOS --- */}
      <section id="planos" className="py-24 px-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Planos que cabem no seu negócio</h2>
            <p className="text-white/60">Escolha o nível de inteligência da sua loja.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <PriceCard tier="Starter" price="59,90" features={['Controle de estoque', 'Gestão de clientes', 'Relatórios Mensais']} />
            <PriceCard tier="Pro" price="99,90" featured={true} features={['Tudo do plano Starter+','1 Dispositivo MiniCortex AI', 'IA Personalizada','Suporte']} />
            <PriceCard tier="Enterprise" price="199,90" features={['Tudo do plano Pro+','1 Dispositivo Cortex AI', 'API de Dados', 'Suporte VIP']} />
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black mb-12 text-center text-white">Dúvidas Frequentes</h2>
          <div className="space-y-4">
            <FaqItem q="Preciso de internet para funcionar?" a="Sim, o assistente utiliza processamento em nuvem e precisa de uma conexão Wi-Fi estável." />
            <FaqItem q="A IA aprende sozinha sobre minha loja?" a="Você fornece a base de dados inicial e a IA otimiza as respostas conforme seu comando." />
            <FaqItem q="O hardware tem garantia?" a="Sim, fornecemos garantia total e substituição imediata em planos Pro e Enterprise." />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-white/10 text-center">
        <p className="text-sm text-white/40 font-medium">© 2026 CORTEX.AI - Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

// --- SUBCOMPONENTES AUXILIARES ---

function StepCard({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="p-8 bg-white/5 backdrop-blur-sm rounded-3xl shadow-sm border border-white/10 hover:border-blue-400/30 transition-colors">
      <span className="text-4xl font-black text-white/20 mb-4 block">{number}</span>
      <h3 className="text-xl font-black mb-2 text-white">{title}</h3>
      <p className="text-white/60 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function PriceCard({ tier, price, features, featured = false }: any) {
  return (
    <div className={`p-8 rounded-[2rem] border ${featured ? 'bg-blue-500 border-blue-400 scale-105 shadow-2xl shadow-blue-500/20' : 'bg-white/5 backdrop-blur-sm border-white/10'} transition-all`}>
      <h3 className="text-xl font-black mb-2 text-white">{tier}</h3>
      <div className="mb-6">
        <span className="text-4xl font-black text-white">R${price}</span>
        {price !== 'Sob Consulta' && <span className="text-sm text-white/40 font-bold">/mês</span>}
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((f: string) => (
          <li key={f} className="flex items-center gap-2 text-sm font-medium text-white/80">
            <Check size={16} className={featured ? 'text-white' : 'text-blue-400'} /> {f}
          </li>
        ))}
      </ul>
      <button className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${featured ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'}`}>
        Assinar Agora
      </button>
    </div>
  );
}

function FaqItem({ q, a }: { q: string, a: string }) {
  return (
    <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl group cursor-pointer hover:bg-white/10 border border-transparent hover:border-white/20 transition-all">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-white">{q}</h4>
        <ChevronDown size={18} className="text-white/40 group-hover:rotate-180 transition-transform" />
      </div>
      <p className="mt-4 text-sm text-white/60 leading-relaxed font-medium">{a}</p>
    </div>
  );
}