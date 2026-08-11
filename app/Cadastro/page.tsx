// app/cadastro/page.tsx
'use client';
import Link from 'next/link';
import { useState, FormEvent } from 'react';

import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  CheckCircle,
  Store,
  Phone,
  Mail,
  Lock,
  User,
  ChevronRight,
  FileText
} from 'lucide-react';

import Modal from '@/components/Modal';

type FormDataType = {
  empresa: string;
  responsavel: string;
  email: string;
  telefone: string;
  identificador: string;
  senha: string;
  confirmarSenha: string;
};

type ErrorsType = Partial<Record<keyof FormDataType, string>> & { geral?: string };

export default function PaginaCadastro() {
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
  const [modalOpen, setModalOpen] = useState<'terms' | 'privacy' | null>(null);




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
      // Usar a nova API de cadastro
      
      const response = await fetch('/api/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa: formData.empresa,
          responsavel: formData.responsavel,
          email: formData.email,
          telefone: formData.telefone,
          cpfCnpj: formData.identificador,
          senha: formData.senha,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.erro || 'Erro ao cadastrar');
      }

      const { token } = await response.json();

      // Usar Firebase para confirmar o login
      const { signInWithCustomToken } = await import('firebase/auth');
      const { auth } = await import('@/src/firebase');

      await signInWithCustomToken(auth, token);

      console.log('Cadastro realizado com sucesso');

      setTimeout(() => {
        window.location.href = '/Dashboard/Produtos';
      }, 1500);
    } catch (error: unknown) {
      console.error('Cadastro falhou:', error);
      setErros({
        geral: error instanceof Error ? error.message : 'Erro ao cadastrar',
      });
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
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12">
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl dark:bg-blue-400/10"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-slate-900/10 rounded-full blur-3xl dark:bg-slate-700/10"></div>
        </div>

        <div>
          <div className="flex items-center gap-4 mb-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-slate-100/80 border border-slate-200/80 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/10 dark:bg-slate-900/80 dark:border-slate-700 dark:shadow-none">
              <img src="/logo.png" alt="Cortex AI" className="h-10 w-10 object-contain" />
            </div>
            <div>
              <div className="text-base uppercase tracking-[0.35em] font-semibold text-slate-950 dark:text-white">CortexAI</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Cadastro de empresa</div>
            </div>
          </div>

          <h2 className="text-5xl font-bold mb-6">
            Crie sua conta<br />
            <span className="text-blue-400">e entre no controle</span>
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-12 leading-relaxed">
            Cadastre sua empresa e tenha acesso a vendas, estoque e clientes em um só painel.
          </p>

          <div className="bg-slate-100/80 backdrop-blur border border-slate-200/70 rounded-lg p-6 dark:bg-slate-900/80 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              <span className="font-semibold text-slate-950 dark:text-white">Cadastro seguro</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Seus dados ficam protegidos e você entra no sistema com tranquilidade.</p>
          </div>
        </div>

        <div className="bg-slate-100/80 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-950 dark:text-white mb-4">O que você ganha</h3>
          <div className="grid gap-3">
            {[
              { icone: TrendingUp, texto: 'Mais vendas com métricas' },
              { icone: DollarSign, texto: 'Controle financeiro fácil' },
              { icone: Users, texto: 'Clientes organizados' },
              { icone: Target, texto: 'Metas inteligentes' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <item.icone className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-slate-600 dark:text-slate-300">{item.texto}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-blue-200 text-sm">
          © 2026 CortexAI. Todos os direitos reservados.
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-slate-100/90 dark:bg-slate-950/95 rounded-3xl p-8 shadow-2xl border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-3 lg:hidden mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-slate-100 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
              <img src="/logo.png" alt="Cortex AI" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-950 dark:text-white">CortexAI</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Cadastro rápido</div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-950 dark:text-white mb-2">Vamos começar</h1>
            <p className="text-slate-500 dark:text-slate-400">Cadastre sua empresa em três etapas rápidas.</p>
          </div>

          {erros.geral && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {erros.geral}
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Etapa {etapa} de 3</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {etapa === 1 ? 'Empresa' : etapa === 2 ? 'Contato' : 'Senha'}
              </span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    num <= etapa ? 'bg-blue-900 dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Etapa 1 */}
            {etapa === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nome da empresa
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      value={formData.empresa}
                      onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      placeholder="Ex: Padaria da Dona Maria"
                    />
                  </div>
                  {erros.empresa && (
                    <p className="mt-1 text-sm text-red-500">{erros.empresa}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nome do responsável
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      value={formData.responsavel}
                      onChange={(e) => setFormData({...formData, responsavel: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      placeholder="seu@email.com"
                    />
                  </div>
                  {erros.email && (
                    <p className="mt-1 text-sm text-red-500">{erros.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: formatarTelefone(e.target.value)})}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        CPF / CNPJ (Apenas números)
      </label>
      <div className="relative">
        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={formData.identificador}
          // Remove tudo que não for número e limita a 14 caracteres no estado
          onChange={(e) => {
            const apenasNumeros = e.target.value.replace(/\D/g, '').slice(0, 14);
            setFormData({...formData, identificador: apenasNumeros});
          }}
          className="w-full pl-10 pr-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <input
                      type="password"
                      value={formData.senha}
                      onChange={(e) => setFormData({...formData, senha: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  {erros.senha && (
                    <p className="mt-1 text-sm text-red-500">{erros.senha}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <input
                      type="password"
                      value={formData.confirmarSenha}
                      onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                  className="flex-1 px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
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
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 dark:border-slate-700"
                required
              />
              <label htmlFor="termos" className="text-xs text-slate-600 dark:text-slate-400">
                Li e aceito os{' '}
                <button
                  type="button"
                  onClick={() => setModalOpen('terms')}
                  className="text-blue-700 dark:text-blue-300 font-medium hover:underline"
                >
                  Termos de Uso
                </button>{' '}
                e{' '}
                <button
                  type="button"
                  onClick={() => setModalOpen('privacy')}
                  className="text-blue-700 dark:text-blue-300 font-medium hover:underline"
                >
                  Política de Privacidade
                </button>
              </label>
            </div>

            {/* Login */}
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Já tem uma conta?{' '}
              <Link href="/Login" className="text-blue-700 dark:text-blue-300 font-medium hover:underline">
                Fazer login
              </Link>
            </p>
          </form>

          <Modal
            isOpen={modalOpen !== null}
            onClose={() => setModalOpen(null)}
            title={modalOpen === 'terms' ? 'Termos de Uso' : 'Política de Privacidade'}
            size="lg"
            footer={
              <button
                onClick={() => setModalOpen(null)}
                className="px-4 py-2 rounded-xl bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-all"
              >
                Fechar
              </button>
            }
          >
            {modalOpen === 'terms' ? (
              <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">Termos de Uso do CortexAI</p>
                <p>Ao se cadastrar, você cria uma conta autorizada para acessar o painel de controle, cadastrar produtos, clientes, vendas e gerenciar o estoque da sua empresa.</p>
                <p>Seu acesso é individual e intransferível. Você deve manter suas credenciais seguras, não compartilhar senha com terceiros e usar a plataforma apenas para atividades comerciais e administrativas relacionadas à sua empresa.</p>
                <p>O CortexAI fornece recursos de gestão, mas não se responsabiliza por uso indevido da conta, por conteúdo inserido incorretamente ou por ações que violem leis, normas ou os direitos de outras pessoas.</p>
                <p>Ao aceitar estes termos, você concorda em fornecer informações verdadeiras, manter os dados da empresa e dos clientes atualizados e respeitar as regras de uso do sistema.</p>
              </div>
            ) : (
              <div className="space-y-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Política de Privacidade</p>
                <p>Quando você se cadastra, o CortexAI coleta os dados necessários para criar sua conta, validar o acesso e operar o sistema: nome da empresa, e-mail, telefone, CPF/CNPJ e outras informações de contato.</p>
                <p>Esses dados são usados para autenticação, ativação do serviço, comunicação sobre a conta e suporte técnico. Também podem ser usados para melhorar a experiência e entregar funcionalidades relevantes dentro da plataforma.</p>
                <p>O CortexAI não compartilha suas informações pessoais com terceiros sem consentimento, exceto quando exigido por lei ou para cumprir obrigações regulatórias.</p>
                <p>Os seus dados são armazenados com medidas de segurança e o acesso é restrito a pessoas autorizadas. Você pode atualizar suas informações sempre que necessário para manter o cadastro correto.</p>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
}
