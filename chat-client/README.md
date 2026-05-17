# Chat Client

Interface web do mini chat em tempo real. O projeto usa React, TypeScript,
Vite, Material UI, React Router e Socket.IO Client.

## Objetivo

Este cliente permite que um usuario faca login, entre em uma sala de chat e
troque mensagens em tempo real com outros usuarios conectados.

## Por que usar socket em um chat?

Chats precisam de comunicacao bidirecional e imediata. Se o cliente usasse
apenas HTTP tradicional, ele teria que ficar perguntando ao servidor se existem
mensagens novas, o que gera atraso, muitas requisicoes e desperdicio de rede.

Com Socket.IO, o navegador mantem uma conexao aberta com o servidor. Assim:

- o cliente envia uma mensagem no momento em que o usuario clica em "Enviar";
- o servidor distribui essa mensagem para todos os clientes conectados;
- cada cliente recebe a nova mensagem sem atualizar a pagina;
- eventos como conexao, desconexao e erros podem ser tratados em tempo real.

O Socket.IO tambem oferece recursos uteis por cima de WebSocket, como fallback
de transporte, reconexao automatica e uma API baseada em eventos.

## Fluxo da aplicacao

1. O usuario acessa `/login`.
2. A tela envia `email` e `senha` para o endpoint `POST /auth/login`.
3. O servidor valida as credenciais e retorna um JWT.
4. O cliente salva o token e os dados do usuario no `localStorage`.
5. A rota `/chat` e liberada apenas quando existe usuario e token.
6. A pagina de chat cria uma conexao Socket.IO usando o token.
7. As mensagens sao enviadas pelo evento `enviar_mensagem`.
8. As mensagens recebidas chegam pelo evento `receber_mensagem`.

## Estrutura principal

- `src/main.tsx`: configura React, tema, rotas e `AuthProvider`.
- `src/App.tsx`: declara as rotas `/login` e `/chat`.
- `src/context/AuthProvider.tsx`: cuida de login, logout, token e usuario.
- `src/routes/ProtectedRoute.tsx`: bloqueia `/chat` sem autenticacao.
- `src/pages/LoginPage.tsx`: formulario de entrada.
- `src/pages/ChatPage.tsx`: interface do chat e conexao com socket.
- `src/socket.ts`: fabrica conexoes Socket.IO autenticadas.

## Variaveis de ambiente

O cliente usa valores padrao locais, mas pode ser configurado com:

```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

Crie um arquivo `.env` local se precisar mudar as URLs. Arquivos `.env` nao
devem ser enviados ao GitHub.

## Como rodar

Instale as dependencias:

```bash
npm install
```

Inicie o cliente:

```bash
npm run dev
```

Por padrao, o Vite roda em:

```text
http://localhost:5173
```

## Scripts

- `npm run dev`: inicia o servidor de desenvolvimento do Vite.
- `npm run build`: valida TypeScript e gera build de producao.
- `npm run lint`: executa ESLint.
- `npm run preview`: serve o build localmente para conferencia.

## Credenciais de teste

As credenciais ficam no servidor, em uma lista fake de usuarios:

```text
danilo@email.com / 123456
maria@email.com / 123456
```

## Observacoes importantes

- O servidor precisa estar rodando antes de tentar logar.
- A URL permitida no CORS do servidor deve bater com a URL usada no navegador.
- Se o servidor estiver com `CLIENT_URL=http://localhost:5173`, acesse o cliente
  por `http://localhost:5173`, nao por `http://127.0.0.1:5173`.
- O token fica no `localStorage` por simplicidade didatica. Em um projeto real,
  vale avaliar cookies `HttpOnly`, refresh token, expiracao e protecoes extras.
