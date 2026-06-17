# 🔐 Configuração Firebase Admin SDK - INSTRUÇÕES

## Problema Resolvido
Seus produtos e categorias agora ficarão **sincronizados com seu usuário** no Firebase Firestore. Quando você fizer login em outro dispositivo com o mesmo email/senha, todos os dados serão carregados automaticamente.

## O que mudou?
1. ✅ **Cadastro** agora cria usuário no Firebase Authentication
2. ✅ **Login** agora autentica contra Firebase  
3. ✅ **Dados de Produtos/Categorias** estão salvos em `empresas/{uid}/produtos` e `empresas/{uid}/categorias`
4. ✅ Quando faz login em outro dispositivo, os dados são **automaticamente carregados**

## 📋 Como Configurar as Credenciais do Firebase Admin SDK

O arquivo `.env.local` foi criado, mas você precisa preenchê-lo com as credenciais reais do seu Firebase.

### Passo 1: Acesse o Firebase Console
1. Vá para [https://console.firebase.google.com](https://console.firebase.google.com)
2. Clique no seu projeto **cortexai-5add6**

### Passo 2: Baixe a Chave da Conta de Serviço
1. No menu esquerdo, clique em ⚙️ **Configurações do Projeto**
2. Vá para a aba **"Contas de Serviço"**
3. Clique no botão **"Gerar Nova Chave Privada"**
4. Um arquivo JSON será baixado (geralmente algo como `cortexai-5add6-xxxxx.json`)

### Passo 3: Extraia os Valores
Abra o JSON baixado e procure pelos campos:
```json
{
  "type": "service_account",
  "project_id": "cortexai-5add6",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@cortexai-5add6.iam.gserviceaccount.com"
}
```

### Passo 4: Atualize o `.env.local`
Substitua os valores em `.env.local`:

```env
FIREBASE_PROJECT_ID=cortexai-5add6
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@cortexai-5add6.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nCOPIE_AQUI_TUDO_NO_MEIO\n-----END PRIVATE KEY-----\n"
```

**⚠️ IMPORTANTE:**
- A `private_key` no JSON já vem com `\n` - **não altere nada**
- Copie-a exatamente como está entre aspas duplas
- **NUNCA** compartilhe este arquivo com ninguém
- **NUNCA** faça commit do `.env.local` no Git (já está no `.gitignore`)

### Passo 5: Reinicie o Servidor
```bash
npm run dev
```

## ✅ Testar a Configuração

1. **Acesse** `http://localhost:3000/Cadastro`
2. **Preencha** o formulário com:
   - Nome da Empresa: `Loja Teste`
   - Responsável: `Seu Nome`
   - Email: `seu@email.com`
   - Telefone: `(11) 98765-4321`
   - CPF/CNPJ: `12345678901234` (qualquer valor de 14 dígitos)
   - Senha: `123456`

3. **Se funcionar:**
   - ✅ Será redirecionado para `/Dashboard/Produtos`
   - ✅ Você conseguirá cadastrar produtos e categorias
   - ✅ Ao fazer logout e fazer login novamente, os dados estarão lá
   - ✅ Em outro dispositivo, com o mesmo email/senha, todos os dados aparecerão

## 🐛 Troubleshooting

### Erro: "FIREBASE_PRIVATE_KEY is undefined"
- Certifique-se de que `.env.local` existe e tem as variáveis
- Reinicie o servidor (`npm run dev`)

### Erro: "Email já cadastrado"
- Use um email diferente que não foi cadastrado antes
- Ou delete o usuário no Firebase Console

### Erro: "Telefone inválido"
- Telefone deve ter entre 10 e 11 dígitos
- Formato: `11987654321` ou `(11) 98765-4321`

### Dados não aparecem em outro dispositivo
- Certifique-se de fazer login com a mesma email/senha
- Verificar se o token está sendo salvo corretamente no localStorage
- Checar o console do navegador (`F12` > `Console` > `Storage`)

## 📚 Arquivos Alterados

- ✅ `app/api/cadastro/route.ts` - Criar usuário no Firebase Auth
- ✅ `app/api/cadastro/login/route.ts` - Autenticar no Firebase
- ✅ `context/AuthContext.tsx` - Usar Firebase Auth Listener
- ✅ `lib/authClient.ts` - Nova arquivo com funções de autenticação
- ✅ `app/Login/page.tsx` - Usar nova autenticação
- ✅ `app/Cadastro/page.tsx` - Usar nova autenticação
- ✅ `.env.local` - Variáveis de ambiente

## 🎉 Resultado Final

Seu sistema agora tem **sincronização completa em tempo real** com Firebase! Produtos e categorias ficarão sempre associados ao usuário.
