'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { signInDirect } from '@/lib/authClient';
import { Eye, EyeOff, Lock, Mail, Shield, CheckCircle } from 'lucide-react';

type FormErrors = { email?: string; senha?: string; geral?: string };

export default function PaginaLogin() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });

  const [erros, setErros] = useState<FormErrors>({});
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const validarFormulario = () => {
    const novosErros: FormErrors = {};

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
    } catch (error: unknown) {
      console.error(error);
      setErros({
        geral: error instanceof Error ? error.message : 'Erro ao fazer login'
      });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-4 mb-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-slate-100/80 border border-slate-200/70 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/10 dark:bg-slate-900/80 dark:border-slate-700 dark:shadow-none">
              <img src="/logo.png" alt="Cortex AI" className="h-10 w-10 object-contain" />
            </div>
            <div>
              <div className="text-base uppercase tracking-[0.35em] font-semibold text-slate-900 dark:text-white">CortexAI</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Login de empresa</div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-5xl font-bold mb-6 text-slate-950 dark:text-white">
            Gestão inteligente<br />
            <span className="text-blue-600 dark:text-blue-400">para seu negócio</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-12 leading-relaxed">
            Acesse sua conta com o e-mail cadastrado e tenha todo o controle na palma da mão.
          </p>

          <div className="bg-slate-100/80 backdrop-blur border border-slate-200/70 rounded-lg p-6 dark:bg-slate-900/80 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              <span className="font-semibold text-slate-900 dark:text-white">Login por e-mail</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Use seu e-mail e senha para entrar.</p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-950 dark:text-white mb-2">Bem-vindo de volta</h1>
              <p className="text-slate-600 dark:text-slate-400">Faça login para continuar</p>
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (erros.email) setErros({ ...erros, email: undefined });
                    }}
                    disabled={carregando}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>
                {erros.email && <p className="text-red-600 text-xs mt-1">{erros.email}</p>}
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={formData.senha}
                    onChange={(e) => {
                      setFormData({ ...formData, senha: e.target.value });
                      if (erros.senha) setErros({ ...erros, senha: undefined });
                    }}
                    disabled={carregando}
                    className="w-full pl-10 pr-12 py-3 border border-slate-200 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
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
              className="w-full py-3 border-2 border-slate-900 text-slate-900 font-semibold rounded-lg transition-colors hover:bg-slate-900 hover:text-white dark:border-slate-200 dark:text-slate-100 dark:hover:bg-slate-800"
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
