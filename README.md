# CortexAI

Sistema web desenvolvido com Next.js, React e Firebase.

## Requisitos

- [Node.js](https://nodejs.org/) 22 ou superior
- npm 10 ou superior, instalado junto com o Node.js
- Um projeto Firebase com Authentication e Firestore habilitados

As dependências JavaScript necessárias estão declaradas em `package.json` e bloqueadas em `package-lock.json`. Não é necessário instalar bibliotecas uma a uma.

## Instalação

1. Clone ou extraia o projeto e abra um terminal na pasta dele.
2. Instale exatamente as versões registradas no projeto:

   ```bash
   npm ci
   ```

3. Crie o arquivo de configuração local a partir do modelo:

   ```bash
   cp .env.example .env.local
   ```

   No Windows PowerShell, use:

   ```powershell
   Copy-Item .env.example .env.local
   ```

4. Preencha `.env.local` com as credenciais do seu projeto Firebase. Consulte [SETUP_FIREBASE_ADMIN.md](SETUP_FIREBASE_ADMIN.md) para obter a chave da conta de serviço.
5. Habilite os provedores de login desejados em **Firebase Authentication** e crie um banco **Cloud Firestore**. Aplique as regras em [FIRESTORE_RULES.md](FIRESTORE_RULES.md).
6. Para ativar a verificação humana no cadastro, crie um widget no [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) e preencha `NEXT_PUBLIC_TURNSTILE_SITE_KEY` e `TURNSTILE_SECRET_KEY` no `.env.local`.
7. Inicie o ambiente de desenvolvimento:

   ```bash
   npm run dev
   ```

8. Abra [http://localhost:3000](http://localhost:3000).

## Produção

Antes de publicar:

1. Configure na hospedagem todas as variáveis listadas em `.env.example`. `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` e `TURNSTILE_SECRET_KEY` são segredos e nunca devem ser expostos no navegador.
2. Adicione o domínio publicado aos domínios autorizados do Firebase Authentication e aos nomes de host permitidos do Cloudflare Turnstile.
3. Publique as regras de segurança do banco:

   ```bash
   firebase deploy --only firestore:rules
   ```

4. Gere e execute a versão de produção:

```bash
npm ci
npm run build
npm start
```

5. Depois da publicação, teste a página inicial, login, criação de uma conta de teste, recuperação de senha e o isolamento dos dados entre duas contas diferentes.

## Comandos disponíveis

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Executa o site em desenvolvimento. |
| `npm run build` | Gera a versão otimizada de produção. |
| `npm start` | Inicia a versão de produção após o build. |
| `npm run lint` | Verifica problemas de código. |

## Segurança

`.env.local` contém credenciais privadas e já está ignorado pelo Git. Não o envie para repositórios, e-mails ou mensagens. O arquivo `.env.example` contém somente nomes e valores de exemplo seguros para compartilhar.
