// lib/authClient.ts
import { auth } from '@/src/firebase';
import {
  signInWithCustomToken,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';

interface LoginCredentials {
  email: string;
  senha: string;
}

interface SignupData {
  email: string;
  senha: string;
  responsavel: string;
  empresa: string;
  telefone: string;
  cpfCnpj: string;
}

/**
 * Autentica o usuário no Firebase usando token customizado
 * Este token é gerado pelo servidor após validação do email/senha
 */
export async function signInWithToken(token: string): Promise<FirebaseUser> {
  const result = await signInWithCustomToken(auth, token);
  return result.user;
}

/**
 * Login direto com email e senha
 * Tenta autenticar diretamente no Firebase
 */
export async function signInDirect(credentials: LoginCredentials): Promise<FirebaseUser> {
  try {
    const result = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.senha
    );
    return result.user;
  } catch (error: any) {
    // Se falhar no client, tenta pelo servidor
    const response = await fetch('/api/cadastro/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email,
        senha: credentials.senha,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.erro || 'Falha na autenticação');
    }

    const { token } = await response.json();
    return signInWithToken(token);
  }
}

/**
 * Cadastro de novo usuário
 */
export async function signUp(data: SignupData): Promise<{ user: FirebaseUser; token: string }> {
  // Primeiro, cria o usuário no servidor (Firebase Admin)
  const response = await fetch('/api/cadastro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.erro || 'Falha no cadastro');
  }

  const { token } = await response.json();

  // Usa o token para autenticar no Firebase
  const user = await signInWithToken(token);

  // Atualiza o perfil do usuário com o nome
  await updateProfile(user, {
    displayName: data.responsavel,
  });

  return { user, token };
}

/**
 * Logout do usuário
 */
export async function logout(): Promise<void> {
  await signOut(auth);
}

/**
 * Obtém o usuário atual
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Obtém o token de autenticação do usuário atual
 */
export async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

/**
 * Listener para mudanças no estado de autenticação
 */
export function onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  return auth.onAuthStateChanged(callback);
}
