// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Brain, TrendingUp, DollarSign, Users, Target, Shield,
  BarChart3, ShoppingCart, Wallet, LineChart, PieChart,
  Rocket, Award, CheckCircle, Star, Phone, Mail,
  ArrowRight, ChevronRight, Play, Menu, X,
  Smartphone, Tablet, Laptop, Clock, Zap,
  CreditCard, Building2, User, Heart, Globe
} from 'lucide-react';

export default function Home() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navegarPara = (destino) => {
    setMenuAberto(false);
    window.location.href = destino;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header fixo com transparência no scroll */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-white shadow-lg py-2' : 'bg-transparent py-4'
      }`}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Brain className={`w-8 h-8 ${
                scrollY > 50 ? 'text-[#0A1A2F]' : 'text-white'
              }`} />
              <span className={`text-xl font-bold ${
                scrollY > 50 ? 'text-[#0A1A2F]' : 'text-white'
              }`}>
                CortexAI
              </span>
            </div>

            {/* Menu Desktop */}
            <nav className="hidden md:flex items-center gap-8">
              {['Início', 'Recursos', 'Preços', 'Depoimentos', 'Contato'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                    scrollY > 50 ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* Botões Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => navegarPara('/login')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  scrollY > 50
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => navegarPara('/cadastro')}
                className="px-4 py-2 bg-[#0A1A2F] text-white text-sm font-medium rounded-lg hover:bg-[#1C3B5E] transition-colors"
              >
                Começar grátis
              </button>
            </div>

            {/* Menu Mobile Button */}
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="md:hidden"
            >
              {menuAberto ? (
                <X className={`w-6 h-6 ${scrollY > 50 ? 'text-[#0A1A2F]' : 'text-white'}`} />
              ) : (
                <Menu className={`w-6 h-6 ${scrollY > 50 ? 'text-[#0A1A2F]' : 'text-white'}`} />
              )}
            </button>
          </div>

          {/* Menu Mobile */}
          {menuAberto && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-xl rounded-b-2xl p-4">
              <nav className="flex flex-col gap-2">
                {['Início', 'Recursos', 'Preços', 'Depoimentos', 'Contato'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setMenuAberto(false)}
                  >
                    {item}
                  </a>
                ))}
                <div className="border-t border-gray-100 my-2 pt-2">
                  <button
                    onClick={() => navegarPara('/login')}
                    className="w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => navegarPara('/cadastro')}
                    className="w-full px-4 py-3 bg-[#0A1A2F] text-white rounded-lg hover:bg-[#1C3B5E] transition-colors mt-2"
                  >
                    Começar grátis
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background com gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1A2F] via-[#0F2A40] to-[#1A4B6D]">
          {/* Elementos decorativos animados */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400/5 rounded-full blur-3xl"></div>
        </div>

        {/* Conteúdo do Hero */}
        <div className="relative container mx-auto px-4 md:px-6 text-center z-10">
          {/* Badge */}
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 mb-8">
            <Star className="w-4 h-4 text-yellow-400 mr-2" />
            <span className="text-sm text-white">+2.500 microempreendedores confiam</span>
          </div>

          {/* Título principal */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Gestão inteligente para<br />
            <span className="bg-gradient-to-r from-blue-300 to-purple-300 text-transparent bg-clip-text">
              micro e pequenas empresas
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Organize suas finanças, aumente suas vendas e tome decisões melhores 
            com a ajuda da inteligência artificial.
          </p>

          {/* Botões CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => navegarPara('/cadastro')}
              className="px-8 py-4 bg-white text-[#0A1A2F] text-lg font-bold rounded-xl hover:bg-blue-50 transition-all transform hover:scale-105 shadow-2xl"
            >
              Começar agora - é grátis
            </button>
            <button
              onClick={() => navegarPara('#demo')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white text-lg font-bold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Ver demonstração
            </button>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { valor: '2.5k+', label: 'Empresas ativas' },
              { valor: 'R$ 45M+', label: 'Vendas processadas' },
              { valor: '98%', label: 'Clientes satisfeitos' },
              { valor: '24/7', label: 'Suporte disponível' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{stat.valor}</div>
                <div className="text-sm text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Seção: Para quem é o CortexAI */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Solução completa para todos os perfis
            </h2>
            <p className="text-lg text-gray-600">
              Seja você MEI, microempresa ou pequeno negócio, o CortexAI se adapta às suas necessidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icone: User,
                titulo: 'MEI',
                descricao: 'Controle total do seu negócio, declaração anual automatizada e relatórios simplificados.',
                beneficios: ['Declaração MEI automática', 'Controle de notas fiscais', 'App gratuito']
              },
              {
                icone: Building2,
                titulo: 'Microempresa',
                descricao: 'Gestão completa com múltiplos usuários, controle de estoque e relatórios avançados.',
                beneficios: ['Até 5 usuários', 'Controle de estoque', 'Integração bancária']
              },
              {
                icone: Heart,
                titulo: 'Pequeno Negócio',
                descricao: 'Soluções personalizadas para crescimento, com IA preditiva e suporte prioritário.',
                beneficios: ['IA preditiva', 'Suporte 24/7', 'Relatórios personalizados']
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-[#0A1A2F]/10 rounded-xl flex items-center justify-center mb-6">
                  <item.icone className="w-7 h-7 text-[#0A1A2F]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{item.titulo}</h3>
                <p className="text-gray-600 mb-4">{item.descricao}</p>
                <ul className="space-y-2">
                  {item.beneficios.map((beneficio, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {beneficio}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção: Recursos principais */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Tudo que seu negócio precisa em um só lugar
            </h2>
            <p className="text-lg text-gray-600">
              Ferramentas poderosas e fáceis de usar, desenvolvidas especialmente para quem empreende
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icone: Wallet,
                titulo: 'Controle Financeiro',
                descricao: 'Acompanhe entradas e saídas, fluxo de caixa e contas a pagar/receber',
                cor: 'blue'
              },
              {
                icone: ShoppingCart,
                titulo: 'Gestão de Vendas',
                descricao: 'Registre vendas, emita notas fiscais e acompanhe seu faturamento',
                cor: 'green'
              },
              {
                icone: BarChart3,
                titulo: 'Relatórios Inteligentes',
                descricao: 'Gráficos e relatórios detalhados para análise do seu negócio',
                cor: 'purple'
              },
              {
                icone: Target,
                titulo: 'Metas e Objetivos',
                descricao: 'Defina metas de vendas e acompanhe seu progresso em tempo real',
                cor: 'yellow'
              },
              {
                icone: Brain,
                titulo: 'IA Preditiva',
                descricao: 'Previsões de vendas e recomendações personalizadas',
                cor: 'red'
              },
              {
                icone: Shield,
                titulo: 'Segurança Total',
                descricao: 'Seus dados protegidos com criptografia de ponta a ponta',
                cor: 'indigo'
              }
            ].map((recurso, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className={`w-12 h-12 bg-${recurso.cor}-100 rounded-lg flex items-center justify-center mb-4`}>
                  <recurso.icone className={`w-6 h-6 text-${recurso.cor}-600`} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{recurso.titulo}</h3>
                <p className="text-gray-600 text-sm">{recurso.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção: Depoimentos */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Quem usa, recomenda
            </h2>
            <p className="text-lg text-gray-600">
              Veja o que nossos clientes estão dizendo sobre o CortexAI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                nome: 'Maria da Silva',
                empresa: 'Padaria da Dona Maria',
                depoimento: 'Antes do CortexAI, eu não sabia direito se meu negócio dava lucro ou prejuízo. Agora tenho tudo organizado e minhas vendas aumentaram 40%!',
                avatar: '👵',
                rating: 5
              },
              {
                nome: 'João Mendes',
                empresa: 'Mercado do João',
                depoimento: 'A declaração do MEI que era um pesadelo agora é feita em 2 cliques. Vale cada centavo!',
                avatar: '👨‍🦰',
                rating: 5
              },
              {
                nome: 'Ana Oliveira',
                empresa: 'Ana Beauty Salon',
                depoimento: 'Consigo acompanhar minhas clientes, agendamentos e finanças tudo num lugar só. Simplesmente incrível!',
                avatar: '👩',
                rating: 5
              }
            ].map((depo, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{depo.avatar}</div>
                  <div>
                    <h4 className="font-bold text-gray-800">{depo.nome}</h4>
                    <p className="text-sm text-gray-500">{depo.empresa}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(depo.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 italic">"{depo.depoimento}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção: Preços */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Planos que cabem no seu bolso
            </h2>
            <p className="text-lg text-gray-600">
              Comece grátis e evolua conforme seu negócio cresce
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plano Grátis */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Grátis</h3>
              <div className="text-3xl font-bold text-gray-800 mb-4">R$ 0</div>
              <p className="text-gray-500 text-sm mb-6">Para quem está começando</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Controle financeiro básico',
                  'Até 50 vendas/mês',
                  'Relatórios simples',
                  'Suporte por e-mail'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navegarPara('/cadastro')}
                className="w-full py-3 border-2 border-[#0A1A2F] text-[#0A1A2F] rounded-lg font-medium hover:bg-[#0A1A2F] hover:text-white transition-colors"
              >
                Começar grátis
              </button>
            </div>

            {/* Plano Profissional */}
            <div className="bg-white rounded-2xl p-8 border-2 border-[#0A1A2F] shadow-xl relative transform scale-105">
              <div className="absolute top-0 right-0 bg-[#0A1A2F] text-white px-4 py-1 text-sm rounded-bl-xl rounded-tr-xl">
                Mais popular
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Profissional</h3>
              <div className="text-3xl font-bold text-gray-800 mb-4">R$ 49,90</div>
              <p className="text-gray-500 text-sm mb-6">Por mês, faturamento anual</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Tudo do plano grátis',
                  'Vendas ilimitadas',
                  'Nota fiscal eletrônica',
                  'Controle de estoque',
                  'Suporte prioritário',
                  'Relatórios avançados'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navegarPara('/cadastro')}
                className="w-full py-3 bg-[#0A1A2F] text-white rounded-lg font-medium hover:bg-[#1C3B5E] transition-colors"
              >
                Testar 7 dias grátis
              </button>
            </div>

            {/* Plano Empresarial */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Empresarial</h3>
              <div className="text-3xl font-bold text-gray-800 mb-4">R$ 99,90</div>
              <p className="text-gray-500 text-sm mb-6">Por mês, faturamento anual</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Tudo do plano profissional',
                  'Múltiplos usuários',
                  'Integração bancária',
                  'IA preditiva',
                  'API personalizada',
                  'Suporte 24/7'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navegarPara('/cadastro')}
                className="w-full py-3 border-2 border-[#0A1A2F] text-[#0A1A2F] rounded-lg font-medium hover:bg-[#0A1A2F] hover:text-white transition-colors"
              >
                Testar 7 dias grátis
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: CTA Final */}
      <section className="py-20 bg-gradient-to-br from-[#0A1A2F] to-[#1C3B5E]">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para transformar seu negócio?
          </h2>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Junte-se a mais de 2.500 empreendedores que já estão usando o CortexAI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navegarPara('/cadastro')}
              className="px-8 py-4 bg-white text-[#0A1A2F] text-lg font-bold rounded-xl hover:bg-blue-50 transition-all transform hover:scale-105"
            >
              Criar minha conta grátis
            </button>
            <button
              onClick={() => navegarPara('#contato')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white text-lg font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              Falar com consultor
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Sobre */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-blue-400" />
                <span className="text-lg font-bold">CortexAI</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Gestão inteligente para micro e pequenas empresas com o poder da inteligência artificial.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold mb-4">Produto</h4>
              <ul className="space-y-2">
                {['Recursos', 'Preços', 'Depoimentos', 'FAQ'].map((item, i) => (
                  <li key={i}>
                    <a href={`#${item.toLowerCase()}`} className="text-gray-400 hover:text-white transition-colors text-sm">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Suporte</h4>
              <ul className="space-y-2">
                {['Central de ajuda', 'Contato', 'Termos de uso', 'Privacidade'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Download</h4>
              <p className="text-gray-400 text-sm mb-4">
                Baixe nosso app e gerencie seu negócio de onde estiver.
              </p>
              <div className="flex flex-col gap-2">
                <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
                  <Smartphone className="w-5 h-5" />
                  <span className="text-sm">App Store</span>
                </button>
                <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
                  <Tablet className="w-5 h-5" />
                  <span className="text-sm">Google Play</span>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© 2024 CortexAI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}