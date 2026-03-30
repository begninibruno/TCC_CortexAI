'use client';

import { useState } from 'react';
import { 
  Brain, Lock, ArrowRight, Eye, EyeOff,
  Shield, Phone, CheckCircle, AlertCircle, User,
  Building2, CreditCard, Fingerprint
} from 'lucide-react';

export default function PaginaLogin() {
  const [formData, setFormData] = useState({
    identificador: '',
    senha: ''
  });
  const [tipoLogin, setTipoLogin] = useState('cpf'); // 'cpf' ou 'cnpj'
  const [erros, setErros] = useState<any>({});
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [loginSucesso, setLoginSucesso] = useState(false);

  const validarFormulario = () => {
    const novosErros: any = {};

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    setCarregando(true);
    setErros({}); 

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identificador: formData.identificador,
          senha: formData.senha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErros({ geral: data.erro || 'Falha ao realizar login' });
        setCarregando(false);
        return;
      }

      // Sucesso: Salva o token e redireciona
      localStorage.setItem('@CortexAI:token', data.token);
      setLoginSucesso(true);

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);

    } catch (error) {
      setErros({ geral: 'Erro de conexão com o servidor.' });
      setCarregando(false);
    }
  };

  const formatarCPF = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    return numeros.replace(/(\d{3})(\d)/, '$1.$2')
                  .replace(/(\d{3})(\d)/, '$1.$2')
                  .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatarCNPJ = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    return numeros.replace(/^(\d{2})(\d)/, '$1.$2')
                  .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                  .replace(/\.(\d{3})(\d)/, '.$1/$2')
                  .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  const handleIdentificadorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login realizado!</h2>
          <p className="text-gray-600 mb-6">Bem-vindo de volta ao CortexAI</p>
          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Redirecionando para o dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1A2F] to-[#1C3B5E] flex">
      {/* Lado esquerdo - Conteúdo (Escondido em mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F2A40] to-[#1A4B6D] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-300" />
            <span className="text-2xl font-bold text-white">CortexAI</span>
          </div>
        </div>

        <div className="relative space-y-8">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Gestão inteligente<br />
            <span className="text-blue-300">para seu negócio</span>
          </h1>
          <p className="text-blue-100 text-lg">
            Acesse sua conta com CPF ou CNPJ e tenha todo o controle na palma da mão.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <User className="w-5 h-5 text-blue-300" />
                <span className="text-white font-medium">MEI</span>
              </div>
              <p className="text-blue-200 text-sm">Acesse com seu CPF para o negócio individual</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="w-5 h-5 text-purple-300" />
                <span className="text-white font-medium">Empresas</span>
              </div>
              <p className="text-blue-200 text-sm">Utilize o CNPJ para acesso empresarial completo</p>
            </div>
          </div>
        </div>

        <div className="relative text-blue-200 text-sm">© 2026 CortexAI.</div>
      </div>

      {/* Lado direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bem-vindo de volta</h2>
            <p className="text-gray-500 text-sm">Escolha como deseja acessar sua conta</p>
          </div>

          {/* Seletor CPF/CNPJ */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => { setTipoLogin('cpf'); setFormData({...formData, identificador: ''}); setErros({}); }}
              className={`p-4 rounded-xl border-2 transition-all ${tipoLogin === 'cpf' ? 'border-[#0A1A2F] bg-[#0A1A2F]/5' : 'border-gray-200'}`}
            >
              <User className={`w-6 h-6 mx-auto mb-2 ${tipoLogin === 'cpf' ? 'text-[#0A1A2F]' : 'text-gray-400'}`} />
              <span className="text-sm font-medium block text-center">CPF</span>
            </button>
            <button
              type="button"
              onClick={() => { setTipoLogin('cnpj'); setFormData({...formData, identificador: ''}); setErros({}); }}
              className={`p-4 rounded-xl border-2 transition-all ${tipoLogin === 'cnpj' ? 'border-[#0A1A2F] bg-[#0A1A2F]/5' : 'border-gray-200'}`}
            >
              <Building2 className={`w-6 h-6 mx-auto mb-2 ${tipoLogin === 'cnpj' ? 'text-[#0A1A2F]' : 'text-gray-400'}`} />
              <span className="text-sm font-medium block text-center">CNPJ</span>
            </button>
          </div>

          {/* Alerta de erro da API */}
          {erros.geral && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {erros.geral}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tipoLogin === 'cpf' ? 'CPF' : 'CNPJ'}</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.identificador}
                  onChange={handleIdentificadorChange}
                  maxLength={tipoLogin === 'cpf' ? 14 : 18}
                  className={`w-full pl-10 pr-3 py-2 border ${erros.identificador ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#0A1A2F] outline-none`}
                  placeholder={tipoLogin === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                />
              </div>
              {erros.identificador && <p className="mt-1 text-xs text-red-500">{erros.identificador}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={formData.senha}
                  onChange={(e) => setFormData({...formData, senha: e.target.value})}
                  className={`w-full pl-10 pr-10 py-2 border ${erros.senha ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#0A1A2F] outline-none`}
                  placeholder="••••••"
                />
                <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {erros.senha && <p className="mt-1 text-xs text-red-500">{erros.senha}</p>}
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-[#0A1A2F] text-white py-3 rounded-lg font-medium hover:bg-[#1C3B5E] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {carregando ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <>Acessar dashboard <ArrowRight className="w-4 h-4" /></>}
            </button>

            <a href="/Cadastro" className="block text-center w-full border-2 border-[#0A1A2F] text-[#0A1A2F] py-3 rounded-lg font-medium hover:bg-[#0A1A2F] hover:text-white transition-colors">
              Criar nova conta
            </a>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center gap-4">
            <div className="flex items-center gap-1 text-xs text-gray-500"><Shield className="w-4 h-4 text-green-500" /> Dados protegidos</div>
            <div className="flex items-center gap-1 text-xs text-gray-500"><Lock className="w-4 h-4 text-green-500" /> SSL Ativo</div>
          </div>
        </div>
      </div>
    </div>
  );
}