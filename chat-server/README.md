# Chat Server

API e servidor de eventos do mini chat em tempo real. O projeto usa Node.js,
Express, TypeScript, Socket.IO, JWT, bcrypt, Zod, CORS e rate limiting.

## Objetivo

Este servidor autentica usuarios, emite tokens JWT e mantem uma conexao em
tempo real com os clientes para envio e recebimento de mensagens de chat.

## Por que usar socket em um chat?

Um chat precisa que o servidor consiga enviar dados para os clientes no momento
em que algo acontece. HTTP comum funciona muito bem para requisicoes pontuais,
como login ou buscar dados, mas nao e ideal para mensagens em tempo real.

Sem socket, o cliente teria que fazer polling, ou seja, requisicoes repetidas ao
servidor perguntando se ha mensagens novas. Isso aumenta trafego, atrasa a
entrega das mensagens e complica a experiencia.

Com Socket.IO:

- cada usuario autenticado mantem uma conexao persistente;
- o cliente emite `enviar_mensagem` quando manda uma mensagem;
- o servidor valida a mensagem e emite `receber_mensagem` para todos;
- o servidor consegue detectar conexoes e desconexoes;
- a autenticacao pode ser exigida no handshake da conexao.

Socket.IO foi escolhido por oferecer uma API simples baseada em eventos, alem
de reconexao automatica e fallback de transporte quando WebSocket puro nao esta
disponivel.

## Responsabilidades do servidor

- Expor endpoint de saude em `GET /health`.
- Validar login em `POST /auth/login`.
- Gerar JWT para usuarios autenticados.
- Validar token em `GET /auth/me`.
- Proteger o handshake do Socket.IO com JWT.
- Receber mensagens pelo evento `enviar_mensagem`.
- Validar conteudo das mensagens com Zod.
- Distribuir mensagens para todos pelo evento `receber_mensagem`.
- Limitar tentativas de login com `express-rate-limit`.

## Fluxo de autenticacao

1. O cliente envia `email` e `senha` para `POST /auth/login`.
2. O servidor valida o formato dos dados com Zod.
3. O servidor procura o usuario fake pelo e-mail.
4. A senha informada e comparada com o hash usando bcrypt.
5. Se estiver correta, o servidor gera um JWT.
6. O cliente usa esse token para acessar rotas protegidas e abrir o socket.

## Fluxo do socket

1. O cliente cria uma conexao Socket.IO enviando o token no `handshake.auth`.
2. O middleware `io.use` valida se o token existe e e valido.
3. O usuario autenticado e salvo em `socket.data.usuario`.
4. Ao receber `enviar_mensagem`, o servidor valida o texto.
5. O servidor monta a mensagem com o nome do usuario autenticado.
6. A mensagem e enviada para todos os clientes com `io.emit`.

## Estrutura principal

- `server.ts`: configura Express, autentica usuarios e registra eventos socket.
- `.env`: configuracoes locais de porta, CORS e JWT.
- `package.json`: scripts e dependencias do servidor.
- `tsconfig.json`: configuracao TypeScript.

## Variaveis de ambiente

Crie um arquivo `.env` local com:

```env
PORT=3001
CLIENT_URL=http://localhost:5173
JWT_SECRET=troque-este-segredo
JWT_EXPIRES_IN=1h
BCRYPT_SALT_ROUNDS=10
NODE_ENV=development
```

O arquivo `.env` nao deve ser enviado ao GitHub. Para documentar as variaveis,
prefira criar um `.env.example` sem segredos reais.

## Como rodar

Instale as dependencias:

```bash
npm install
```

Inicie o servidor em modo desenvolvimento:

```bash
npm run start
```

Por padrao, o servidor roda em:

```text
http://localhost:3001
```

## Endpoints

### `GET /health`

Retorna o status basico do servidor.

### `POST /auth/login`

Corpo esperado:

```json
{
  "email": "danilo@email.com",
  "senha": "123456"
}
```

Resposta de sucesso:

```json
{
  "token": "...",
  "usuario": {
    "id": "1",
    "nome": "Danilo",
    "email": "danilo@email.com"
  }
}
```

### `GET /auth/me`

Requer header:

```text
Authorization: Bearer <token>
```

## Eventos Socket.IO

### Cliente envia: `enviar_mensagem`

```json
{
  "texto": "Ola!"
}
```

### Servidor emite: `receber_mensagem`

```json
{
  "texto": "Ola!",
  "usuario": "Danilo",
  "criadoEm": "10:30"
}
```

### Servidor emite: `erro_mensagem`

Emitido quando a mensagem nao passa na validacao.

## Credenciais de teste

Usuarios fake definidos em `server.ts`:

```text
danilo@email.com / 123456
maria@email.com / 123456
```

## Pontos relevantes

- Este projeto usa usuarios em memoria apenas para estudo. Reiniciar o servidor
  recria a lista fake.
- Em producao, usuarios e mensagens deveriam ir para um banco de dados.
- O `JWT_SECRET` precisa ser forte e privado.
- O CORS deve permitir apenas a URL real do cliente.
- O rate limit reduz abuso no endpoint de login, mas nao substitui outras
  protecoes de seguranca.
- As mensagens sao transmitidas para todos os usuarios conectados; ainda nao ha
  salas, historico persistente, moderacao ou confirmacao de entrega.
