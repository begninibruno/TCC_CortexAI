'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  Brain,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  AlertCircle,
  User,
  Mail
} from 'lucide-react';


// FIREBASE

import { auth } from '@/src/firebase';

import {
  signInWithEmailAndPassword
} from 'firebase/auth';


export default function PaginaLogin() {

  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });

  const [erros, setErros] = useState<any>({});

  const [carregando, setCarregando] = useState(false);

  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [loginSucesso, setLoginSucesso] = useState(false);



  // VALIDAR FORMULÁRIO

  const validarFormulario = () => {

    const novosErros: any = {};

    if (!formData.email) {

      novosErros.email = 'E-mail é obrigatório';

    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {

      novosErros.email = 'E-mail inválido';

    }

    if (!formData.senha) {

      novosErros.senha = 'Senha é obrigatória';

    }

    setErros(novosErros);

    return Object.keys(novosErros).length === 0;

  };



  // LOGIN FIREBASE

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (!validarFormulario()) return;

    setCarregando(true);

    setErros({});

    try {

      // LOGIN

      await signInWithEmailAndPassword(

        auth,

        formData.email,

        formData.senha

      );

      console.log('Login realizado');

      setLoginSucesso(true);


      // REDIRECIONA

      setTimeout(() => {

        router.push('/Produtos');

                router.push('/componentes/Sidebar'); // ✅ REDIRECIONAMENTO

        router.push('/Dashboard/Produtos');
      }, 1500);

    } catch (error: any) {

      console.error(error);

      
      // ERROS FIREBASE

      if (
        error.code === 'auth/user-not-found'
      ) {

        setErros({
          geral: 'Usuário não encontrado'
        });

      } else if (
        error.code === 'auth/wrong-password'
      ) {

        setErros({
          geral: 'Senha incorreta'
        });

      } else if (
        error.code === 'auth/invalid-credential'
      ) {

        setErros({
          geral: 'E-mail ou senha inválidos'
        });

      } else if (
        error.code === 'auth/invalid-email'
      ) {

        setErros({
          geral: 'E-mail inválido'
        });

      } else {

        setErros({
          geral: 'Erro ao fazer login'
        });

      }

    } finally {

      setCarregando(false);

    }

  };



  // INPUT EMAIL

  const handleEmailChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    setFormData({
      ...formData,
      email: e.target.value
    });

    if (erros.email) {

      setErros({
        ...erros,
        email: undefined
      });

    }

  };



  // TELA SUCESSO

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

      {/* ESQUERDA */}

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F2A40] to-[#1A4B6D] p-12 flex-col justify-between relative overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-full">

          <div className="absolute top-10 left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

          <div className="absolute bottom-10 right-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl"></div>

        </div>

        <div className="relative">

          <div className="flex items-center gap-2">

            <Brain className="w-8 h-8 text-blue-300" />

            <span className="text-2xl font-bold text-white">

              CortexAI

            </span>

          </div>

        </div>

        <div className="relative space-y-8">

          <h1 className="text-4xl font-bold text-white leading-tight">

            Gestão inteligente

            <br />

            <span className="text-blue-300">

              para seu negócio

            </span>

          </h1>

          <p className="text-blue-100 text-lg">

            Acesse sua conta com o e-mail cadastrado e tenha todo o controle na palma da mão.

          </p>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">

            <div className="flex items-center gap-3 mb-3">

              <Mail className="w-5 h-5 text-blue-300" />

              <span className="text-white font-medium">

                Login por e-mail

              </span>

            </div>

            <p className="text-blue-200 text-sm">

              Use seu e-mail e senha para entrar.

            </p>

          </div>

        </div>

      </div>



      {/* DIREITA */}

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">

        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">

          <div className="mb-8">

            <h2 className="text-2xl font-bold text-gray-800 mb-2">

              Bem-vindo de volta

            </h2>

            <p className="text-gray-500 text-sm">

              Faça login para continuar

            </p>

          </div>



          {/* ERRO */}

          {erros.geral && (

            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">

              <AlertCircle className="w-4 h-4" />

              {erros.geral}

            </div>

          )}



          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">

                E-mail

              </label>

              <div className="relative">

                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="email"
                  value={formData.email}
                  onChange={handleEmailChange}
                  className={`w-full pl-10 pr-3 py-2 border ${erros.email ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#0A1A2F] outline-none text-gray-900 placeholder:text-gray-500`}
                  placeholder="seu@email.com"
                />

              </div>

              {erros.email && (

                <p className="mt-1 text-xs text-red-500">

                  {erros.email}

                </p>

              )}

            </div>



            {/* SENHA */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">

                Senha

              </label>

              <div className="relative">

                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={formData.senha}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      senha: e.target.value
                    })
                  }
                  className={`w-full pl-10 pr-10 py-2 border ${erros.senha ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#0A1A2F] outline-none placeholder:text-gray-500`}
                  placeholder="••••••"
                />

                <button
                  type="button"
                  onClick={() =>
                    setMostrarSenha(!mostrarSenha)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >

                  {mostrarSenha
                    ? <EyeOff className="w-5 h-5" />
                    : <Eye className="w-5 h-5" />
                  }

                </button>

              </div>

              {erros.senha && (

                <p className="mt-1 text-xs text-red-500">

                  {erros.senha}

                </p>

              )}

            </div>



            {/* BOTÃO */}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-[#0A1A2F] text-white py-3 rounded-lg font-medium hover:bg-[#1C3B5E] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >

              {carregando ? (

                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>

              ) : (

                <>
                  Acessar dashboard
                  <ArrowRight className="w-4 h-4" />
                </>

              )}

            </button>



            <a
              href="/Cadastro"
              className="block text-center w-full border-2 border-[#0A1A2F] text-[#0A1A2F] py-3 rounded-lg font-medium hover:bg-[#0A1A2F] hover:text-white transition-colors"
            >

              Criar nova conta

            </a>

          </form>



          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center gap-4">

            <div className="flex items-center gap-1 text-xs text-gray-500">

              <Shield className="w-4 h-4 text-green-500" />

              Dados protegidos

            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500">

              <Lock className="w-4 h-4 text-green-500" />

              SSL Ativo

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}