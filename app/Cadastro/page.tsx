// app/cadastro/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';

import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  ArrowRight,
  CheckCircle,
  Brain,
  Store,
  Phone,
  Mail,
  Lock,
  User,
  ChevronRight,
  FileText
} from 'lucide-react';

import { auth, db } from '@/src/firebase';

import { createUserWithEmailAndPassword } from 'firebase/auth';

import { doc, setDoc } from 'firebase/firestore';

type FormDataType = {
  empresa: string;
  responsavel: string;
  email: string;
  telefone: string;
  identificador: string;
  senha: string;
  confirmarSenha: string;
};

type ErrorsType = Partial<Record<keyof FormDataType, string>>;

export default function PaginaCadastro() {
  const router = useRouter();
  const [etapa, setEtapa] = useState(1);
  const [formData, setFormData] = useState<FormDataType>({
    empresa: '',
    responsavel: '',
    email: '',
    telefone: '',
    identificador: '', // ADICIONADO AQUI
    senha: '',
    confirmarSenha: ''
  });
  const [erros, setErros] = useState<ErrorsType>({} as ErrorsType);
  const [carregando, setCarregando] = useState(false);
  const [cadastroSucesso, setCadastroSucesso] = useState(false);





  const validarEtapa = () => {
    const novosErros: ErrorsType = {};

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
      if (!formData.identificador) novosErros.identificador = 'CPF ou CNPJ é obrigatório';
      
   
    } else if (etapa === 3) {
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {

  e.preventDefault();

  if (!validarEtapa()) return;

  setCarregando(true);

  try {

    // CRIA USUÁRIO NO FIREBASE AUTH

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.senha
      );

    const user = userCredential.user;


    // SALVA DADOS NO FIRESTORE

    await setDoc(
      doc(db, 'empresas', user.uid),
      {

        empresa: formData.empresa,

        responsavel: formData.responsavel,

        email: formData.email,

        telefone: formData.telefone,

        identificador: formData.identificador,

        createdAt: new Date()

      }
    );

    console.log('Cadastro realizado com sucesso');

    router.push('/Dashboard/PDV');

  } catch (error) {

    console.error('Cadastro falhou:', error);

    alert('Erro ao cadastrar');

  } finally {

    setCarregando(false);

  }

};



  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 11) {
      return numeros.replace(/^(\d{2})(\d)/g, '($1) $2')
                    .replace(/(\d)(\d{4})$/, '$1-$2');
    }
    return valor;
  };

  

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
              {etapa === 3 && 'Crie sua senha'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Etapa {etapa} de 3
            </p>
          </div>

          {/* Progresso */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((num) => (
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
          value={formData.identificador}
          // Remove tudo que não for número e limita a 14 caracteres no estado
          onChange={(e) => {
            const apenasNumeros = e.target.value.replace(/\D/g, '').slice(0, 14);
            setFormData({...formData, identificador: apenasNumeros});
          }}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1A2F] focus:border-transparent"
          placeholder="Ex: 12345678901"
          maxLength={14} 
        />
      </div>
      {erros.identificador && (
        <p className="mt-1 text-sm text-red-500">{erros.identificador}</p>
      )}
    </div>
  </>
)}

            
            {/* Etapa 3 */}
            {etapa === 3 && (
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
              
              {etapa < 3 ? (
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