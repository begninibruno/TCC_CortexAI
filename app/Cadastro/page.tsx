// app/cadastro/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, Users, Target, Shield, 
  ArrowRight, CheckCircle, Zap, Brain, BarChart3,
  Store, Phone, Mail, Lock, User, Building2,
  ChevronRight, Sparkles, Award, Clock, Play,
  FileText // Adicionei este ícone para o documento
} from 'lucide-react';

export default function PaginaCadastro() {
  const [etapa, setEtapa] = useState(1);
  const [formData, setFormData] = useState({
    empresa: '',
    responsavel: '',
    email: '',
    telefone: '',
    cpfCnpj: '', // ADICIONADO AQUI
    tipoNegocio: '',
    faturamento: '',
    senha: '',
    confirmarSenha: ''
  });
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [cadastroSucesso, setCadastroSucesso] = useState(false);

  const tiposNegocio = [
    'Varejo - Loja física',
    'Varejo - Online',
    'Alimentação',
    'Serviços',
    'Indústria',
    'Profissional Liberal'
  ];

  const faixasFaturamento = [
    'Até R$ 5.000/mês',
    'R$ 5.000 a R$ 15.000/mês',
    'R$ 15.000 a R$ 30.000/mês',
    'Acima de R$ 30.000/mês'
  ];

  const validarEtapa = () => {
    const novosErros = {};

    if (etapa === 1) {
      if (!formData.empresa) novosErros.empresa = 'Nome da empresa é obrigatório';
      if (!formData.responsavel) novosErros.responsavel = 'Nome do responsável é obrigatório';
    } else if (etapa === 2) {
      if (!formData.email) {
        novosErros.email = 'E-mail é obrigatório';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        novosErros.email = 'E-mail inválido';
      }
      if (!formData.telefone) novosErros.telefone = 'Telefone é obrigatório';
      
      // VALIDAÇÃO DO NOVO CAMPO ADICIONADA AQUI
      if (!formData.cpfCnpj) novosErros.cpfCnpj = 'CPF ou CNPJ é obrigatório';
      
    } else if (etapa === 3) {
      if (!formData.tipoNegocio) novosErros.tipoNegocio = 'Selecione o tipo de negócio';
    } else if (etapa === 4) {
      if (!formData.senha) {
        novosErros.senha = 'Senha é obrigatória';
      } else if (formData.senha.length < 6) {
        novosErros.senha = 'Mínimo 6 caracteres';
      }
      if (formData.senha !== formData.confirmarSenha) {
        novosErros.confirmarSenha = 'Senhas não coincidem';
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const avancarEtapa = () => {
    if (validarEtapa()) {
      setEtapa(etapa + 1);
    }
  };

  const voltarEtapa = () => {
    setEtapa(etapa - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarEtapa()) return;

    setCarregando(true);
    setTimeout(() => {
      setCarregando(false);
      setCadastroSucesso(true);
    }, 2000);
  };

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 11) {
      return numeros.replace(/^(\d{2})(\d)/g, '($1) $2')
                    .replace(/(\d)(\d{4})$/, '$1-$2');
    }
    return valor;
  };

  if (cadastroSucesso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1A2F] to-[#1C3B5E] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Cadastro concluído!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Bem-vindo ao CortexAI, {formData.responsavel}!
          </p>
          
          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-blue-800 mb-2">
              📧 Enviamos um e-mail para {formData.email}
            </p>
            <p className="text-sm text-blue-800">
              📱 Em breve entraremos em contato via WhatsApp
            </p>
          </div>
          
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-[#0A1A2F] text-white py-3 rounded-xl font-medium hover:bg-[#1C3B5E] transition-colors"
          >
            Acessar minhas informações
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1A2F] to-[#1C3B5E] flex">
      {/* Lado esquerdo - Conteúdo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F2A40] to-[#1A4B6D] p-12 flex-col justify-between relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-300" />
            <span className="text-2xl font-bold text-white">CortexAI</span>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="relative space-y-8">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Sua gestão financeira<br />
            <span className="text-blue-300">com inteligência artificial</span>
          </h1>

          <p className="text-blue-100 text-lg">
            Mais de 2.000 microempreendedores já estão usando o CortexAI<br />
            para organizar suas finanças e aumentar as vendas.
          </p>

          {/* Benefícios */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icone: TrendingUp, texto: 'Aumento médio de 47% nas vendas' },
              { icone: DollarSign, texto: 'Redução de 30% em custos' },
              { icone: Users, texto: '+1.500 clientes ativos' },
              { icone: Target, texto: 'Metas personalizadas' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <item.icone className="w-5 h-5 text-blue-300" />
                <span className="text-sm text-white">{item.texto}</span>
              </div>
            ))}
          </div>

          {/* Depoimento */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <p className="text-white/90 text-sm italic mb-3">
              "O CortexAI transformou meu negócio. Agora sei exatamente onde estou errando e onde posso melhorar."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-white font-bold">
                JM
              </div>
              <div>
                <p className="text-white font-medium">João Mendes</p>
                <p className="text-blue-200 text-xs">Mercado do João</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative text-blue-200 text-sm">
          © 2026 CortexAI. Todos os direitos reservados.
        </div>
      </div>

      {/* Lado direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
          {/* Logo mobile */}
          <div className="flex items-center gap-2 lg:hidden mb-6">
            <Brain className="w-6 h-6 text-[#0A1A2F]" />
            <span className="text-xl font-bold text-[#0A1A2F]">CortexAI</span>
          </div>

          {/* Cabeçalho */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {etapa === 1 && 'Dados da empresa'}
              {etapa === 2 && 'Informações de contato'}
              {etapa === 3 && 'Sobre seu negócio'}
              {etapa === 4 && 'Crie sua senha'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Etapa {etapa} de 4
            </p>
          </div>

          {/* Progresso */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  num <= etapa ? 'bg-[#0A1A2F]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Etapa 1 */}
            {etapa === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da empresa
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.empresa}
                      onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1A2F] focus:border-transparent"
                      placeholder="Ex: Padaria da Dona Maria"
                    />
                  </div>
                  {erros.empresa && (
                    <p className="mt-1 text-sm text-red-500">{erros.empresa}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do responsável
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.responsavel}
                      onChange={(e) => setFormData({...formData, responsavel: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1A2F] focus:border-transparent"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  {erros.responsavel && (
                    <p className="mt-1 text-sm text-red-500">{erros.responsavel}</p>
                  )}
                </div>
              </>
            )}

            {/* Etapa 2 */}
            {etapa === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1A2F] focus:border-transparent"
                      placeholder="seu@email.com"
                    />
                  </div>
                  {erros.email && (
                    <p className="mt-1 text-sm text-red-500">{erros.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: formatarTelefone(e.target.value)})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1A2F] focus:border-transparent"
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                    />
                  </div>
                  {erros.telefone && (
                    <p className="mt-1 text-sm text-red-500">{erros.telefone}</p>
                  )}
                </div>

                {/* CPF/CNPJ */}
                <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        CPF / CNPJ (Apenas números)
      </label>
      <div className="relative">
        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={formData.cpfCnpj}
          // Remove tudo que não for número e limita a 14 caracteres no estado
          onChange={(e) => {
            const apenasNumeros = e.target.value.replace(/\D/g, '').slice(0, 14);
            setFormData({...formData, cpfCnpj: apenasNumeros});
          }}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1A2F] focus:border-transparent"
          placeholder="Ex: 12345678901"
          maxLength={14} 
        />
      </div>
      {erros.cpfCnpj && (
        <p className="mt-1 text-sm text-red-500">{erros.cpfCnpj}</p>
      )}
    </div>
  </>
)}

            {/* Etapa 3 */}
            {etapa === 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de negócio
                  </label>
                  <select
                    value={formData.tipoNegocio}
                    onChange={(e) => setFormData({...formData, tipoNegocio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1A2F] focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    {tiposNegocio.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                  {erros.tipoNegocio && (
                    <p className="mt-1 text-sm text-red-500">{erros.tipoNegocio}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Faturamento mensal (opcional)
                  </label>
                  <select
                    value={formData.faturamento}
                    onChange={(e) => setFormData({...formData, faturamento: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1A2F] focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    {faixasFaturamento.map(faixa => (
                      <option key={faixa} value={faixa}>{faixa}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-bold">💡 Dica:</span> Sabendo seu faturamento, podemos personalizar melhor as recomendações para seu negócio.
                  </p>
                </div>
              </>
            )}

            {/* Etapa 4 */}
            {etapa === 4 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={formData.senha}
                      onChange={(e) => setFormData({...formData, senha: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1A2F] focus:border-transparent"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  {erros.senha && (
                    <p className="mt-1 text-sm text-red-500">{erros.senha}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={formData.confirmarSenha}
                      onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1A2F] focus:border-transparent"
                      placeholder="Digite novamente"
                    />
                  </div>
                  {erros.confirmarSenha && (
                    <p className="mt-1 text-sm text-red-500">{erros.confirmarSenha}</p>
                  )}
                </div>
              </>
            )}

            {/* Botões de navegação */}
            <div className="flex gap-3 pt-4">
              {etapa > 1 && (
                <button
                  type="button"
                  onClick={voltarEtapa}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Voltar
                </button>
              )}
              
              {etapa < 4 ? (
                <button
                  type="button"
                  onClick={avancarEtapa}
                  className="flex-1 bg-[#0A1A2F] text-white py-2 rounded-lg hover:bg-[#1C3B5E] transition-colors flex items-center justify-center gap-2"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={carregando}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {carregando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      Finalizar
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Termos */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="termos"
                className="w-4 h-4 text-[#0A1A2F] border-gray-300 rounded focus:ring-[#0A1A2F]"
                required
              />
              <label htmlFor="termos" className="text-xs text-gray-600">
                Li e aceito os{' '}
                <a href="#" className="text-[#0A1A2F] font-medium hover:underline">
                  Termos de Uso
                </a>{' '}
                e{' '}
                <a href="#" className="text-[#0A1A2F] font-medium hover:underline">
                  Política de Privacidade
                </a>
              </label>
            </div>

            {/* Login */}
            <p className="text-center text-sm text-gray-600">
              Já tem uma conta?{' '}
              <a href="/Login" className="text-[#0A1A2F] font-medium hover:underline">
                Fazer login
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}