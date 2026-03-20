// app/page.tsx
import { 
  Activity, 
  Zap, 
  BarChart3, 
  MessageCircleWarning, 
  ArrowUpRight, 
  Mic, 
  Wifi,
  Database,
  Search
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER ESTRATÉGICO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded">LIVE</span>
              <h1 className="text-2xl font-black tracking-tight">AI COMMAND CENTER</h1>
            </div>
            <p className="text-slate-500 text-sm font-medium">Monitorando Unidade: Loja Principal (ID: 4492)</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-2 px-3 border-r border-slate-100">
                <Wifi size={16} className="text-emerald-500" />
                <span className="text-xs font-bold text-slate-600">LATÊNCIA: 24ms</span>
             </div>
             <button className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-slate-800 transition-all">
                TREINAR NOVA RESPOSTA
             </button>
          </div>
        </div>

        {/* GRID DE MÉTRICAS (SEM COMPONENTE EXTERNO) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Card 01 - Performance */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Zap size={20} /></div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">+12.5%</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Conversões Hoje</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">R$ 3.840</h3>
          </div>

          {/* Card 02 - Volume */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Database size={20} /></div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interações Totais</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">1.284</h3>
          </div>

          {/* Card 03 - Alertas */}
          <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><MessageCircleWarning size={20} /></div>
              <span className="animate-pulse flex h-2 w-2 rounded-full bg-amber-500"></span>
            </div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Falhas de Resposta</p>
            <h3 className="text-3xl font-black text-amber-900 mt-1">07</h3>
          </div>

          {/* Card 04 - Retenção */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><BarChart3 size={20} /></div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Precisão da IA</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">94.2%</h3>
          </div>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Feed de Inteligência */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="font-black text-slate-800 flex items-center gap-2">
                  <Activity size={18} className="text-indigo-600" />
                  ÚLTIMAS CONSULTAS NA LOJA
                </h2>
                <Search size={18} className="text-slate-400 cursor-pointer" />
              </div>
              
              <div className="divide-y divide-slate-100">
                {[
                  { q: "Onde encontro o setor de pet shop?", time: "Agora mesmo", status: "Sucesso" },
                  { q: "Quais são as promoções de hoje?", time: "Há 2 min", status: "Sucesso" },
                  { q: "Vocês aceitam vale refeição?", time: "Há 5 min", status: "Falha" },
                ].map((item, i) => (
                  <div key={i} className="p-5 hover:bg-slate-50 transition-all flex items-center justify-between group">
                    <div className="flex gap-4 items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.status === 'Sucesso' ? 'bg-slate-100 text-slate-400' : 'bg-red-50 text-red-500'}`}>
                        <Mic size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 italic group-hover:text-indigo-600">"{item.q}"</p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.time}</span>
                      </div>
                    </div>
                    <ArrowUpRight size={18} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Painel de Controle Lateral */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
               {/* Decoração Visual */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              
              <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Status do Totem
              </h3>
              
              <div className="space-y-5 relative z-10">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase">Volume de Saída</span>
                  <span className="text-sm font-black text-indigo-400">85%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full">
                  <div className="bg-indigo-500 h-full rounded-full w-[85%]"></div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Temperatura</p>
                    <p className="text-lg font-black text-white">44°C</p>
                  </div>
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Uptime</p>
                    <p className="text-lg font-black text-white">12d</p>
                  </div>
                </div>

                <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-lg">
                  REBOOT SISTEMA
                </button>
              </div>
            </div>

            {/* Sugestão de IA */}
            <div className="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-3xl p-6">
              <h4 className="text-indigo-900 font-black text-sm mb-2 uppercase tracking-tight">Dica de Otimização</h4>
              <p className="text-indigo-700 text-xs font-medium leading-relaxed">
                Detectamos 15 perguntas sobre "Estacionamento" nas últimas 2h. Seu assistente ainda não tem essa informação configurada.
              </p>
              <button className="mt-4 text-xs font-black text-indigo-600 underline">CORRIGIR AGORA</button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}