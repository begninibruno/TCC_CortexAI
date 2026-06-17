'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { signInDirect } from '@/lib/authClient';
import { Eye, EyeOff, Lock, Mail, Shield, CheckCircle } from 'lucide-react';

export default function PaginaLogin() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });

  const [erros, setErros] = useState<any>({});
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const validarFormulario = () => {
    const novosErros: any = {};

    if (!formData.email) {
      novosErros.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      novosErros.email = 'E-mail inválido';
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
      const user = await signInDirect({
        email: formData.email,
        senha: formData.senha
      });

      // Atualizar contexto de autenticação
      login(
        {
          id: user.uid,
          nome: user.displayName || 'Usuário',
          email: user.email || ''
        },
        await user.getIdToken()
      );

      // Redirecionar após sucesso
      router.push('/Dashboard/Produtos');
    } catch (error: any) {
      console.error(error);
      setErros({
        geral: error.message || 'Erro ao fazer login'
      });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-900 via-blue-900 to-slate-900 flex">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white font-bold">⊙</span>
            </div>
            <span className="text-xl font-bold">CortexAI</span>
          </div>
        </div>

        <div>
          <h2 className="text-5xl font-bold mb-6">
            Gestão inteligente<br />
            <span className="text-blue-400">para seu negócio</span>
          </h2>
          <p className="text-lg text-gray-300 mb-12 leading-relaxed">
            Acesse sua conta com o e-mail cadastrado e tenha todo o controle na palma da mão.
          </p>

          <div className="bg-blue-900/30 backdrop-blur border border-blue-800/50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">Login por e-mail</span>
            </div>
            <p className="text-sm text-gray-400">Use seu e-mail e senha para entrar.</p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta</h1>
              <p className="text-gray-500">Faça login para continuar</p>
            </div>

            {/* Error message */}
            {erros.geral && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {erros.geral}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (erros.email) setErros({ ...erros, email: undefined });
                    }}
                    disabled={carregando}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>
                {erros.email && <p className="text-red-600 text-xs mt-1">{erros.email}</p>}
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={formData.senha}
                    onChange={(e) => {
                      setFormData({ ...formData, senha: e.target.value });
                      if (erros.senha) setErros({ ...erros, senha: undefined });
                    }}
                    disabled={carregando}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {erros.senha && <p className="text-red-600 text-xs mt-1">{erros.senha}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={carregando}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {carregando ? 'Acessando...' : 'Acessar dashboard'}
                {!carregando && <span>→</span>}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 border-t border-gray-200" />

            {/* Sign up link */}
            <button
              onClick={() => router.push('/Cadastro')}
              className="w-full py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Criar nova conta
            </button>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-green-600">
                <Shield className="w-4 h-4" />
                <span>Dados protegidos</span>
              </div>
              <div className="w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>SSL Ativo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}