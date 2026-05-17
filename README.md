# Mini Chat em Tempo Real

Este repositorio contem um mini chat em tempo real dividido em dois projetos:

```text
chat/
  chat-client/  # Frontend React
  chat-server/  # Backend Node.js
```

Ele pode ser tratado como um monorepo simples: frontend e backend ficam no
mesmo repositorio, mas cada um ainda tem seu proprio `package.json`,
dependencias e comandos.

## Ideia do projeto

O objetivo e demonstrar como construir um chat com:

- login com credenciais fake;
- autenticacao com JWT;
- rotas protegidas no frontend;
- comunicacao em tempo real com Socket.IO;
- validacao de dados no servidor;
- separacao entre interface web e API.

O projeto e didatico. Ele mostra os conceitos principais sem adicionar banco de
dados, filas, salas privadas ou infraestrutura de producao.

## Como funciona

O fluxo principal e:

1. O usuario acessa o frontend em `http://localhost:5173`.
2. A tela de login envia `email` e `senha` para o backend.
3. O backend valida as credenciais e devolve um token JWT.
4. O frontend salva o usuario e o token.
5. A rota de chat e liberada.
6. O frontend abre uma conexao Socket.IO enviando o token.
7. O backend valida o token no handshake do socket.
8. Quando alguem envia uma mensagem, o backend repassa para todos os usuarios conectados.

## Por que usar Socket.IO?

Em um chat, as mensagens precisam aparecer para todos quase imediatamente.
Com HTTP tradicional, o navegador teria que ficar perguntando ao servidor se
existem mensagens novas. Essa tecnica, chamada polling, funciona, mas gera mais
requisicoes e pode deixar a conversa com atraso.

Socket.IO mantem uma conexao aberta entre cliente e servidor. Assim o servidor
consegue avisar os navegadores quando uma mensagem nova chega. Isso deixa o
chat mais natural, rapido e eficiente.

Neste projeto, o Socket.IO e usado para:

- autenticar a conexao usando JWT;
- receber mensagens pelo evento `enviar_mensagem`;
- enviar mensagens para todos pelo evento `receber_mensagem`;
- detectar conexoes e desconexoes de usuarios.

## Projetos

### `chat-client`

Frontend feito com React, TypeScript, Vite, Material UI, React Router e
Socket.IO Client.

Responsabilidades principais:

- exibir telas de login e chat;
- guardar usuario e token no `localStorage`;
- proteger a rota `/chat`;
- abrir a conexao Socket.IO autenticada;
- renderizar mensagens recebidas em tempo real.

Leia mais em [chat-client/README.md](chat-client/README.md).

### `chat-server`

Backend feito com Node.js, Express, TypeScript, Socket.IO, JWT, bcrypt, Zod,
CORS e rate limiting.

Responsabilidades principais:

- expor endpoints HTTP de autenticacao;
- validar login e gerar JWT;
- proteger a conexao Socket.IO;
- validar mensagens recebidas;
- distribuir mensagens para todos os clientes conectados.

Leia mais em [chat-server/README.md](chat-server/README.md).

## Requisitos

- Node.js instalado
- npm instalado
- duas janelas de terminal: uma para o servidor e outra para o cliente

## Como rodar o projeto

### 1. Instalar dependencias do servidor

```bash
cd chat-server
npm install
```

### 2. Configurar variaveis do servidor

Crie um arquivo `.env` dentro de `chat-server`:

```env
PORT=3001
CLIENT_URL=http://localhost:5173
JWT_SECRET=troque-este-segredo
JWT_EXPIRES_IN=1h
BCRYPT_SALT_ROUNDS=10
NODE_ENV=development
```

### 3. Rodar o servidor

```bash
npm run start
```

O servidor deve iniciar em:

```text
http://localhost:3001
```

### 4. Instalar dependencias do cliente

Em outro terminal:

```bash
cd chat-client
npm install
```

### 5. Rodar o cliente

```bash
npm run dev
```

O cliente deve iniciar em:

```text
http://localhost:5173
```

## Credenciais de teste

O servidor possui usuarios fake em memoria:

```text
danilo@email.com / 123456
maria@email.com / 123456
```

## Comandos uteis

No cliente:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

No servidor:

```bash
npm run start
```

## Observacoes importantes

- Este repositorio nao usa workspaces npm na raiz. Cada projeto deve ser
  instalado e executado dentro da sua propria pasta.
- O backend precisa estar rodando antes de fazer login no frontend.
- A URL do cliente precisa bater com `CLIENT_URL` no `.env` do servidor.
- Arquivos `.env` nao devem ser enviados ao GitHub.
- O projeto usa usuarios em memoria, entao nao ha persistencia real de contas.
- As mensagens tambem nao sao salvas em banco de dados.

## Possiveis evolucoes

- Adicionar banco de dados para usuarios e mensagens.
- Criar cadastro de usuarios.
- Adicionar salas de chat.
- Mostrar usuarios online.
- Persistir historico de conversas.
- Implementar refresh token.
- Criar testes automatizados.
- Transformar o repositorio em monorepo formal com npm workspaces.
