import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt, { Secret, SignOptions } from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { z } from 'zod'

const app = express()

const PORT = Number(process.env.PORT ?? 3001)

const CLIENT_URL =
  process.env.CLIENT_URL ?? 'http://localhost:5173'

const JWT_SECRET: Secret =
  process.env.JWT_SECRET ?? 'dev-secret-change-me'

const JWT_EXPIRES_IN: SignOptions['expiresIn'] =
  (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) ??
  '1h'

const BCRYPT_SALT_ROUNDS = Number(
  process.env.BCRYPT_SALT_ROUNDS ?? 10,
)

app.use(express.json())

app.use(
  cors({
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
  }),
)

app.use(
  '/auth/login',
  rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
      message:
        'Muitas tentativas de login. Tente novamente em instantes.',
    },
  }),
)

interface Usuario {
  id: string
  nome: string
  email: string
  senhaHash: string
}

interface UsuarioToken {
  id: string
  nome: string
  email: string
}

interface Mensagem {
  texto: string
  usuario: string
  criadoEm: string
}

const usuariosFake: Usuario[] = [
  {
    id: '1',
    nome: 'Danilo',
    email: 'danilo@email.com',
    senhaHash: bcrypt.hashSync(
      '123456',
      BCRYPT_SALT_ROUNDS,
    ),
  },
  {
    id: '2',
    nome: 'Maria',
    email: 'maria@email.com',
    senhaHash: bcrypt.hashSync(
      '123456',
      BCRYPT_SALT_ROUNDS,
    ),
  },
]

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6),
})

const mensagemSchema = z.object({
  texto: z.string().trim().min(1).max(500),
})

function gerarToken(usuario: Usuario): string {
  const payload: UsuarioToken = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

function validarToken(token: string): UsuarioToken {
  return jwt.verify(token, JWT_SECRET) as UsuarioToken
}

app.get('/health', (_req, res) => {
  return res.json({
    status: 'ok',
    service: 'mini-chat-server',
  })
})

app.post('/auth/login', async (req, res) => {
  const resultado = loginSchema.safeParse(req.body)

  if (!resultado.success) {
    return res.status(400).json({
      message: 'Dados de login inválidos.',
      errors: resultado.error.flatten().fieldErrors,
    })
  }

  const { email, senha } = resultado.data

  const usuario = usuariosFake.find(
    (item) =>
      item.email.toLowerCase() === email.toLowerCase(),
  )

  if (!usuario) {
    return res.status(401).json({
      message: 'Credenciais inválidas.',
    })
  }

  const senhaValida = await bcrypt.compare(
    senha,
    usuario.senhaHash,
  )

  if (!senhaValida) {
    return res.status(401).json({
      message: 'Credenciais inválidas.',
    })
  }

  const token = gerarToken(usuario)

  return res.json({
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    },
  })
})

app.get('/auth/me', (req, res) => {
  const authorization = req.headers.authorization

  if (!authorization) {
    return res.status(401).json({
      message: 'Token não informado.',
    })
  }

  const [, token] = authorization.split(' ')

  if (!token) {
    return res.status(401).json({
      message: 'Token inválido.',
    })
  }

  try {
    const usuario = validarToken(token)

    return res.json({
      usuario,
    })
  } catch {
    return res.status(401).json({
      message: 'Token inválido ou expirado.',
    })
  }
})

const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
  },
})

io.use((socket, next) => {
  const token = socket.handshake.auth.token

  if (!token || typeof token !== 'string') {
    return next(new Error('Token não informado.'))
  }

  try {
    const usuario = validarToken(token)

    socket.data.usuario = usuario

    return next()
  } catch {
    return next(
      new Error('Token inválido ou expirado.'),
    )
  }
})

io.on('connection', (socket) => {
  const usuario = socket.data.usuario as UsuarioToken

  console.log(
    `Usuário conectado: ${usuario.nome} | socket: ${socket.id}`,
  )

  socket.emit('usuario_conectado', {
    message: `Bem-vindo, ${usuario.nome}!`,
  })

  socket.on('enviar_mensagem', (data) => {
    const resultado = mensagemSchema.safeParse(data)

    if (!resultado.success) {
      socket.emit('erro_mensagem', {
        message:
          'Mensagem inválida. O texto deve ter entre 1 e 500 caracteres.',
      })

      return
    }

    const mensagem: Mensagem = {
      texto: resultado.data.texto,
      usuario: usuario.nome,
      criadoEm: new Date().toLocaleTimeString(
        'pt-BR',
        {
          hour: '2-digit',
          minute: '2-digit',
        },
      ),
    }

    io.emit('receber_mensagem', mensagem)
  })

  socket.on('disconnect', () => {
    console.log(
      `Usuário desconectou: ${usuario.nome} | socket: ${socket.id}`,
    )
  })
})

httpServer.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
  console.log(`Cliente autorizado: ${CLIENT_URL}`)
})