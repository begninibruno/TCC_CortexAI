// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();

// Evita enviar uma chave vazia ou um valor de exemplo para a API do Firebase.
// A mensagem do Firebase nesse caso e apenas "API key not valid", o que torna
// o problema dificil de identificar durante o cadastro ou login.
if (!apiKey || apiKey.length < 20 || /cole_a_api_key_aqui|seu[-_ ]?api[-_ ]?key/i.test(apiKey)) {
  throw new Error(
    'Configuração do Firebase inválida: defina NEXT_PUBLIC_FIREBASE_API_KEY no arquivo .env.local com a chave Web do seu projeto Firebase e reinicie o servidor.'
  );
}

const firebaseConfig = {
  apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;

if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export const auth = getAuth(app);
export const db = getFirestore(app);
