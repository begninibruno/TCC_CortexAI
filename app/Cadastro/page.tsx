'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle, 
  Sparkles, Rocket, Shield, Award, ArrowRight, 
  Github, Linkedin, Twitter, Globe, Heart,
  Star, Code, Cpu, Brain, ChevronRight
} from 'lucide-react';

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
}

export default function Cadastro() {

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: ''
  });

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [erros, setErros] = useState<Partial<FormData>>({});
  const [cadastroSucesso, setCadastroSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles:any[] = [];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5
      });
    }

    function animate() {

      ctx.clearRect(0,0,canvas.width,canvas.height);

      particles.forEach(p => {

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x > canvas.width) p.x = 0;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fillStyle = "rgba(59,130,246,0.3)";
        ctx.fill();

      });

      requestAnimationFrame(animate);

    }

    animate();

  },[]);

  const validarFormulario = () => {

    const novosErros:Partial<FormData> = {};

    if(!formData.nome) novosErros.nome = "Nome obrigatório";
    if(!formData.email) novosErros.email = "Email obrigatório";
    if(!formData.telefone) novosErros.telefone = "Telefone obrigatório";
    if(formData.senha.length < 6) novosErros.senha = "Senha muito curta";
    if(formData.senha !== formData.confirmarSenha) novosErros.confirmarSenha = "Senhas não coincidem";

    setErros(novosErros);

    return Object.keys(novosErros).length === 0;

  };

  const handleSubmit = (e:any)=>{

    e.preventDefault();

    if(!validarFormulario()) return;

    setCarregando(true);

    setTimeout(()=>{

      setCadastroSucesso(true);
      setCarregando(false);

    },1500);

  };

  const handleChange = (e:any)=>{

    const {name,value} = e.target;

    setFormData(prev=>({
      ...prev,
      [name]:value
    }));

  };

  if(cadastroSucesso){

    return(
      <main className="min-h-screen flex items-center justify-center bg-blue-900">

        <div className="text-center text-white">

          <CheckCircle className="mx-auto mb-4 text-green-400" size={60}/>

          <h1 className="text-3xl font-bold mb-2">
            Cadastro realizado!
          </h1>

          <p>
            Enviamos um email para {formData.email}
          </p>

          <button
          onClick={()=>window.location.href="/login"}
          className="mt-6 bg-blue-500 px-6 py-2 rounded-lg"
          >
            Ir para login
          </button>

        </div>

      </main>
    )

  }

  return (

  <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700 p-4">

  <canvas ref={canvasRef} className="absolute inset-0"/>

  <div className="relative bg-white/10 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md border border-white/20">

  <h1 className="text-3xl text-white font-bold mb-6 text-center">
  Criar Conta
  </h1>

  <form onSubmit={handleSubmit} className="space-y-4">

  <input
  type="text"
  name="nome"
  placeholder="Nome"
  value={formData.nome}
  onChange={handleChange}
  className="w-full p-3 rounded-lg bg-white/20 text-white"
  />

  <input
  type="email"
  name="email"
  placeholder="Email"
  value={formData.email}
  onChange={handleChange}
  className="w-full p-3 rounded-lg bg-white/20 text-white"
  />

  <input
  type="tel"
  name="telefone"
  placeholder="Telefone"
  value={formData.telefone}
  onChange={handleChange}
  className="w-full p-3 rounded-lg bg-white/20 text-white"
  />

  <div className="relative">

  <input
  type={mostrarSenha ? "text":"password"}
  name="senha"
  placeholder="Senha"
  value={formData.senha}
  onChange={handleChange}
  className="w-full p-3 rounded-lg bg-white/20 text-white"
  />

  <button
  type="button"
  onClick={()=>setMostrarSenha(!mostrarSenha)}
  className="absolute right-3 top-3"
  >
  {mostrarSenha ? <EyeOff/> : <Eye/>}
  </button>

  </div>

  <input
  type="password"
  name="confirmarSenha"
  placeholder="Confirmar senha"
  value={formData.confirmarSenha}
  onChange={handleChange}
  className="w-full p-3 rounded-lg bg-white/20 text-white"
  />

  <button
  type="submit"
  disabled={carregando}
  className="w-full bg-blue-500 py-3 rounded-xl text-white font-semibold"
  >
  {carregando ? "Criando..." : "Criar conta"}
  </button>

  </form>

  </div>

  </main>

  );

}