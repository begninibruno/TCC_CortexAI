
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
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Cpu className="text-white" size={18} />
            </div>
            <span className="font-black text-xl tracking-tighter">CortexAI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-700">
            <a href="#como-funciona" className="hover:text-indigo-600 transition-colors">Como Funciona</a>
            <a href="#planos" className="hover:text-indigo-600 transition-colors">Planos</a>
            <a href="#sobre" className="hover:text-indigo-600 transition-colors">Sobre Nós</a>
          </div>

          <div className="flex items-center gap-4">
            
           <Link href="/Login">
            <span className="text-sm font-bold text-slate-700 hover:text-indigo-600 cursor-pointer">
            Entrar
            </span>
            </Link>
            <Link href="/Cadastro">
            <span className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:shadow-lg transition-all active:scale-95">
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
            <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              O Futuro do Atendimento Físico
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
              Sua loja agora tem uma <span className="text-indigo-600">Voz Inteligente.</span>
            </h1>
            <p className="text-lg text-slate-500 mb-8 max-w-lg leading-relaxed font-medium">
              Um assistente virtual físico que recebe seus clientes, tira dúvidas e vende, enquanto você gerencia tudo pelo seu celular.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group">
                Ver Planos <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white border-2 border-slate-200 px-8 py-4 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all">
                Falar com consultor
              </button>
            </div>
          </div>
          <div className="relative">
            {/* Representação visual do totem/assistente */}
            <div className="aspect-square bg-gradient-to-br from-indigo-100 to-slate-200 rounded-[3rem] relative overflow-hidden border-8 border-white shadow-2xl flex items-center justify-center">
              <div className="w-48 h-80 bg-slate-900 rounded-3xl border-4 border-slate-800 shadow-2xl flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 bg-indigo-500 rounded-full animate-pulse mb-4 shadow-[0_0_30px_rgba(99,102,241,0.6)]"></div>
                <div className="space-y-2 w-full">
                  <div className="h-2 bg-slate-700 rounded w-3/4 mx-auto"></div>
                  <div className="h-2 bg-slate-700 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
              {/* Floating tags */}
              <div className="absolute top-10 right-10 bg-white p-4 rounded-2xl shadow-xl border border-indigo-50 animate-bounce">
                <MessageSquare className="text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- COMO FUNCIONA --- */}
      <section id="como-funciona" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center mb-16">Instalação em 3 Passos</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard number="01" title="Plug & Play" desc="Conecte o dispositivo na tomada e no Wi-Fi da sua loja." />
            <StepCard number="02" title="Alimente a IA" desc="Suba seu catálogo de produtos e informações da loja no app." />
            <StepCard number="03" title="Venda mais" desc="Seu assistente começa a interagir com os clientes em tempo real." />
          </div>
        </div>
      </section>

      {/* --- SOBRE NÓS / MISSÃO --- */}
      <section id="sobre" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4">Nossa Missão</h2>
          <p className="text-3xl font-bold leading-tight text-slate-800 italic">
            "Queremos democratizar a inteligência artificial de ponta para o varejo físico, transformando cada loja em um ambiente interativo e eficiente."
          </p>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-black text-slate-900">500+</p>
              <p className="text-xs font-bold text-slate-400 uppercase mt-2">Lojas Ativas</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-slate-900">1M+</p>
              <p className="text-xs font-bold text-slate-400 uppercase mt-2">Interações/mês</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-slate-900">98%</p>
              <p className="text-xs font-bold text-slate-400 uppercase mt-2">Satisfação</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-slate-900">24/7</p>
              <p className="text-xs font-bold text-slate-400 uppercase mt-2">Suporte</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PLANOS --- */}
      <section id="planos" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Planos que cabem no seu negócio</h2>
            <p className="text-slate-400">Escolha o nível de inteligência da sua loja.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <PriceCard tier="Starter" price="299" features={['1 Dispositivo', 'IA Padrão', 'Relatórios Mensais']} />
            <PriceCard tier="Pro" price="599" featured={true} features={['2 Dispositivos', 'IA Personalizada', 'Dashboard Real-time', 'Suporte VIP']} />
            <PriceCard tier="Enterprise" price="Sob Consulta" features={['Dispositivos Ilimitados', 'Integração com ERP', 'API de Dados']} />
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black mb-12 text-center">Dúvidas Frequentes</h2>
          <div className="space-y-4">
            <FaqItem q="Preciso de internet para funcionar?" a="Sim, o assistente utiliza processamento em nuvem e precisa de uma conexão Wi-Fi estável." />
            <FaqItem q="A IA aprende sozinha sobre minha loja?" a="Você fornece a base de dados inicial e a IA otimiza as respostas conforme as perguntas dos clientes." />
            <FaqItem q="O hardware tem garantia?" a="Sim, fornecemos garantia total e substituição imediata em planos Pro e Enterprise." />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-400 font-medium">© 2024 VOX.IA - Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

// --- SUBCOMPONENTES AUXILIARES ---

function StepCard({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="p-8 bg-white rounded-3xl shadow-sm border border-slate-200 hover:border-indigo-200 transition-colors">
      <span className="text-4xl font-black text-slate-300 mb-4 block">{number}</span>
      <h3 className="text-xl font-black mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function PriceCard({ tier, price, features, featured = false }: any) {
  return (
    <div className={`p-8 rounded-[2rem] border ${featured ? 'bg-indigo-600 border-indigo-400 scale-105 shadow-2xl shadow-indigo-500/20' : 'bg-slate-800 border-slate-700'} transition-all`}>
      <h3 className="text-xl font-black mb-2">{tier}</h3>
      <div className="mb-6">
        <span className="text-4xl font-black">R${price}</span>
        {price !== 'Sob Consulta' && <span className="text-sm text-slate-400 font-bold">/mês</span>}
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((f: string) => (
          <li key={f} className="flex items-center gap-2 text-sm font-medium">
            <Check size={16} className={featured ? 'text-indigo-200' : 'text-indigo-500'} /> {f}
          </li>
        ))}
      </ul>
      <button className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${featured ? 'bg-white text-indigo-600 hover:bg-indigo-50' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>
        Assinar Agora
      </button>
    </div>
  );
}

function FaqItem({ q, a }: { q: string, a: string }) {
  return (
    <div className="p-6 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-white border border-transparent hover:border-slate-200 transition-all">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-slate-800">{q}</h4>
        <ChevronDown size={18} className="text-slate-400 group-hover:rotate-180 transition-transform" />
      </div>
      <p className="mt-4 text-sm text-slate-500 leading-relaxed font-medium">{a}</p>
    </div>
  );
}