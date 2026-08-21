import { auth } from '@/src/firebase';
import {
  signInWithCustomToken,
  signOut,
  signInWithEmailAndPassword,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  browserLocalPersistence,
  setPersistence,
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

export async function signInWithToken(token: string): Promise<FirebaseUser> {
  await setPersistence(auth, browserLocalPersistence);
  const result = await signInWithCustomToken(auth, token);
  return result.user;
}

// O SDK do Firebase valida a senha; o servidor Admin nunca deve emitir token
// apenas porque um e-mail existe.
export async function signInDirect(credentials: LoginCredentials): Promise<FirebaseUser> {
  await setPersistence(auth, browserLocalPersistence);
  try {
    const result = await signInWithEmailAndPassword(
      auth,
      credentials.email.trim(),
      credentials.senha
    );
    return result.user;
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
    if (['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password'].includes(code)) {
      throw new Error('E-mail ou senha incorretos. Confira os dados e tente novamente.');
    }
    if (code === 'auth/too-many-requests') {
      throw new Error('Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.');
    }
    if (code === 'auth/network-request-failed') {
      throw new Error('Não foi possível conectar. Verifique sua internet e tente novamente.');
    }
    throw new Error('Não foi possível entrar agora. Tente novamente em instantes.');
  }
}

export async function signUp(data: SignupData): Promise<{ user: FirebaseUser; token: string }> {
  const response = await fetch('/api/cadastro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.erro || 'Falha no cadastro');
  }

  const user = await signInWithToken(payload.token);
  await updateProfile(user, { displayName: data.responsavel.trim() });
  return { user, token: payload.token };
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function updateDisplayName(nome: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Sua sessão expirou. Entre novamente para continuar.');
  await updateProfile(user, { displayName: nome.trim() });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('Sua sessão expirou. Entre novamente para continuar.');

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

export async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  return user ? user.getIdToken() : null;
}

export function onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  return auth.onAuthStateChanged(callback);
}
