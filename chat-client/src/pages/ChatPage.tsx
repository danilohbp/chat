import { useEffect, useRef, useState } from 'react'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  Container,
  IconButton,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import SendIcon from '@mui/icons-material/Send'
import { useNavigate } from 'react-router-dom'
import { createSocket } from '../socket'
import { useAuth } from '../context/useAuth'

interface Mensagem {
  texto: string
  usuario: string
  criadoEm: string
}

export function ChatPage() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [novaMensagem, setNovaMensagem] = useState('')

  const finalDasMensagensRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<ReturnType<typeof createSocket> | null>(null)

  const { usuario, token, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) return

    const socket = createSocket(token)
    socketRef.current = socket

    const receberMensagem = (data: Mensagem) => {
      setMensagens((listaAntiga) => [...listaAntiga, data])
    }

    socket.on('receber_mensagem', receberMensagem)

    return () => {
      socket.off('receber_mensagem', receberMensagem)
      socket.disconnect()
      socketRef.current = null
    }
  }, [token])

  useEffect(() => {
    finalDasMensagensRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [mensagens])

  const sair = () => {
    logout()
    navigate('/login')
  }

  const enviarMensagem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const textoTratado = novaMensagem.trim()

    if (!textoTratado || !usuario || !socketRef.current) return

    socketRef.current.emit('enviar_mensagem', {
      texto: textoTratado,
    })

    setNovaMensagem('')
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
            Chat Local
          </Typography>

          <Stack
            sx={{
              flexDirection: 'row',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {usuario?.nome.charAt(0).toUpperCase()}
            </Avatar>

            <Typography>{usuario?.nome}</Typography>

            <IconButton color="inherit" onClick={sair}>
              <LogoutIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card
          elevation={8}
          sx={{
            height: '78vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 3,
              bgcolor: '#f8fafc',
            }}
          >
            {mensagens.length === 0 && (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Nenhuma mensagem ainda
                  </Typography>

                  <Typography>
                    Envie a primeira mensagem para iniciar a conversa.
                  </Typography>
                </Box>
              </Box>
            )}

            {mensagens.map((msg, index) => {
              const minhaMensagem = msg.usuario === usuario?.nome

              return (
                <Box
                  key={`${msg.usuario}-${msg.criadoEm}-${index}`}
                  sx={{
                    display: 'flex',
                    justifyContent: minhaMensagem ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box sx={{ maxWidth: '70%' }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        textAlign: minhaMensagem ? 'right' : 'left',
                        mb: 0.5,
                      }}
                    >
                      {msg.usuario} • {msg.criadoEm}
                    </Typography>

                    <Paper
                      elevation={2}
                      sx={{
                        px: 2,
                        py: 1.3,
                        bgcolor: minhaMensagem ? 'primary.main' : 'white',
                        color: minhaMensagem ? 'white' : 'text.primary',
                        borderRadius: 4,
                        borderBottomRightRadius: minhaMensagem ? 4 : 16,
                        borderBottomLeftRadius: minhaMensagem ? 16 : 4,
                      }}
                    >
                      <Typography>{msg.texto}</Typography>
                    </Paper>
                  </Box>
                </Box>
              )
            })}

            <div ref={finalDasMensagensRef} />
          </Box>

          <Box
            component="form"
            onSubmit={enviarMensagem}
            sx={{
              display: 'flex',
              gap: 2,
              p: 2,
              borderTop: '1px solid #e2e8f0',
              bgcolor: 'white',
            }}
          >
            <TextField
              fullWidth
              size="small"
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
              placeholder="Digite sua mensagem..."
            />

            <Button
              type="submit"
              variant="contained"
              endIcon={<SendIcon />}
            >
              Enviar
            </Button>
          </Box>
        </Card>
      </Container>
    </Box>
  )
}
