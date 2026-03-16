// app/login/page.tsx
'use client';

import { useState } from 'react';
import { 
  Brain, Mail, Lock, ArrowRight, Eye, EyeOff,
  TrendingUp, DollarSign, Users, Target, Shield,
  Store, Phone, CheckCircle, AlertCircle, User,
  Building2, CreditCard, Fingerprint
} from 'lucide-react';

export default function PaginaLogin() {
  const [formData, setFormData] = useState({
    identificador: '',
    senha: ''
  });
  const [tipoLogin, setTipoLogin] = useState('cpf'); // 'cpf' ou 'cnpj'
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [loginSucesso, setLoginSucesso] = useState(false);

  const validarFormulario = () => {
    const novosErros = {};

    if (!formData.identificador) {
      novosErros.identificador = tipoLogin === 'cpf' ? 'CPF é obrigatório' : 'CNPJ é obrigatório';
    } else {
      const numeros = formData.identificador.replace(/\D/g, '');
      if (tipoLogin === 'cpf' && numeros.length !== 11) {
        novosErros.identificador = 'CPF deve ter 11 dígitos';
      } else if (tipoLogin === 'cnpj' && numeros.length !== 14) {
        novosErros.identificador = 'CNPJ deve ter 14 dígitos';
      }
    }

    if (!formData.senha) {
      novosErros.senha = 'Senha é obrigatória';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    setCarregando(true);
    
    // Simulação de login
    setTimeout(() => {
      setCarregando(false);
      setLoginSucesso(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    }, 1500);
  };

  const formatarCPF = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 11) {
      return numeros.replace(/(\d{3})(\d)/, '$1.$2')
                   .replace(/(\d{3})(\d)/, '$1.$2')
                   .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return valor;
  };

  const formatarCNPJ = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 14) {
      return numeros.replace(/^(\d{2})(\d)/, '$1.$2')
                   .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                   .replace(/\.(\d{3})(\d)/, '.$1/$2')
                   .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
    return valor;
  };

  const handleIdentificadorChange = (e) => {
    let valor = e.target.value;
    if (tipoLogin === 'cpf') {
      valor = formatarCPF(valor);
    } else {
      valor = formatarCNPJ(valor);
    }
    setFormData({...formData, identificador: valor});
    if (erros.identificador) {
      setErros({...erros, identificador: undefined});
    }
  };

  if (loginSucesso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1A2F] to-[#1C3B5E] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Login realizado!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Bem-vindo de volta ao CortexAI
          </p>
          
          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              Redirecionando para o dashboard...
            </p>
          </div>
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
            Gestão inteligente<br />
            <span className="text-blue-300">para seu negócio</span>
          </h1>

          <p className="text-blue-100 text-lg">
            Acesse sua conta com CPF (para MEI) ou CNPJ (para empresas)<br />
            e tenha todo o controle na palma da mão.
          </p>

          {/* Cards de informação */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <User className="w-5 h-5 text-blue-300" />
                </div>
                <span className="text-white font-medium">MEI</span>
              </div>
              <p className="text-blue-200 text-sm">
                Acesse com seu CPF para gerenciar seu negócio individual
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Building2 className="w-5 h-5 text-purple-300" />
                </div>
                <span className="text-white font-medium">Empresas</span>
              </div>
              <p className="text-blue-200 text-sm">
                Utilize o CNPJ para acesso completo da sua empresa
              </p>
            </div>
          </div>

          {/* Benefícios */}
          <div className="space-y-3">
            {[
              'Relatórios financeiros em tempo real',
              'Controle de vendas e estoque',
              'Declaração MEI automatizada',
              'Suporte especializado'
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative text-blue-200 text-sm">
          © 202 CortexAI. Todos os direitos reservados.
        </div>
      </div>

      {/* Lado direito - Formulário de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
          {/* Logo mobile */}
          <div className="flex items-center gap-2 lg:hidden mb-6">
            <Brain className="w-6 h-6 text-[#0A1A2F]" />
            <span className="text-xl font-bold text-[#0A1A2F]">CortexAI</span>
          </div>

          {/* Cabeçalho */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-gray-500 text-sm">
              Escolha como deseja acessar sua conta
            </p>
          </div>

          {/* Seletor de tipo de login */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => {
                setTipoLogin('cpf');
                setFormData({...formData, identificador: ''});
                setErros({});
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                tipoLogin === 'cpf'
                  ? 'border-[#0A1A2F] bg-[#0A1A2F]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <User className={`w-6 h-6 mx-auto mb-2 ${
                tipoLogin === 'cpf' ? 'text-[#0A1A2F]' : 'text-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                tipoLogin === 'cpf' ? 'text-[#0A1A2F]' : 'text-gray-500'
              }`}>
                CPF
              </span>
              <span className="block text-xs text-gray-400 mt-1">Para MEI</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTipoLogin('cnpj');
                setFormData({...formData, identificador: ''});
                setErros({});
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                tipoLogin === 'cnpj'
                  ? 'border-[#0A1A2F] bg-[#0A1A2F]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Building2 className={`w-6 h-6 mx-auto mb-2 ${
                tipoLogin === 'cnpj' ? 'text-[#0A1A2F]' : 'text-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                tipoLogin === 'cnpj' ? 'text-[#0A1A2F]' : 'text-gray-500'
              }`}>
                CNPJ
              </span>
              <span className="block text-xs text-gray-400 mt-1">Para empresas</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Identificador (CPF/CNPJ) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {tipoLogin === 'cpf' ? 'CPF' : 'CNPJ'}
              </label>
              <div className="relative">
                {tipoLogin === 'cpf' ? (
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                ) : (
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                )}
                <input
                  type="text"
                  value={formData.identificador}
                  onChange={handleIdentificadorChange}
                  maxLength={tipoLogin === 'cpf' ? 14 : 18}
                  className={`w-full pl-10 pr-3 py-2 border ${
                    erros.identificador ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1A2F] focus:border-transparent transition-colors`}
                  placeholder={tipoLogin === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                />
              </div>
              {erros.identificador && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {erros.identificador}
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={formData.senha}
                  onChange={(e) => {
                    setFormData({...formData, senha: e.target.value});
                    if (erros.senha) {
                      setErros({...erros, senha: undefined});
                    }
                  }}
                  className={`w-full pl-10 pr-10 py-2 border ${
                    erros.senha ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1A2F] focus:border-transparent transition-colors`}
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {mostrarSenha ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {erros.senha && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {erros.senha}
                </p>
              )}
            </div>

            {/* Opções extras */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lembrar}
                  onChange={(e) => setLembrar(e.target.checked)}
                  className="w-4 h-4 text-[#0A1A2F] border-gray-300 rounded focus:ring-[#0A1A2F]"
                />
                <span className="text-sm text-gray-600">Lembrar acesso</span>
              </label>

              <a 
                href="/recuperar-acesso" 
                className="text-sm text-[#0A1A2F] hover:text-[#1C3B5E] hover:underline font-medium"
              >
                Perdeu o acesso?
              </a>
            </div>

            {/* Botão de login */}
            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-[#0A1A2F] text-white py-3 rounded-lg font-medium hover:bg-[#1C3B5E] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {carregando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Entrando...
                </>
              ) : (
                <>
                  Acessar dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Acesso rápido para demonstração */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs text-blue-800 font-medium mb-3 flex items-center gap-1">
                <Fingerprint className="w-4 h-4" />
                Acessos para demonstração:
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-blue-600" />
                    <span className="text-blue-700">MEI (CPF):</span>
                  </div>
                  <div>
                    <span className="text-blue-800 font-mono">000.000.000-00</span>
                    <span className="text-blue-600 ml-2">senha: 123456</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3 h-3 text-blue-600" />
                    <span className="text-blue-700">Empresa (CNPJ):</span>
                  </div>
                  <div>
                    <span className="text-blue-800 font-mono">00.000.000/0000-00</span>
                    <span className="text-blue-600 ml-2">senha: 123456</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Separador */}
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">primeiro acesso?</span>
              </div>
            </div>

            {/* Link para cadastro */}
            <a
              href="/Cadastro"
              className="block text-center w-full border-2 border-[#0A1A2F] text-[#0A1A2F] py-3 rounded-lg font-medium hover:bg-[#0A1A2F] hover:text-white transition-colors group"
            >
              Criar nova conta
            </a>

            {/* Opções de suporte */}
            <div className="flex items-center justify-center gap-4 pt-4 text-xs text-gray-500">
              <a href="#" className="hover:text-[#0A1A2F] flex items-center gap-1">
                <Phone className="w-3 h-3" />
                Suporte MEI
              </a>
              <span>•</span>
              <a href="#" className="hover:text-[#0A1A2F] flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                Suporte empresas
              </a>
            </div>
          </form>

          {/* Selos de segurança */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Dados protegidos</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Lock className="w-4 h-4 text-green-500" />
                <span>Certificado digital</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}