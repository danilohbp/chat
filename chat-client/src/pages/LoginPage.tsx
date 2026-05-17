import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from '@mui/material'
import { useAuth } from '../context/useAuth'

export function LoginPage() {
  const [email, setEmail] = useState('danilo@email.com')
  const [senha, setSenha] = useState('123456')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const entrar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const emailTratado = email.trim()

    if (!emailTratado || !senha) return

    try {
      setErro('')
      setCarregando(true)
      await login(emailTratado, senha)
      navigate('/chat')
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel entrar.',
      )
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #dbeafe, #ede9fe)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={8}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
              Entrar no Chat
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Use seu e-mail e senha para acessar a sala.
            </Typography>

            <Box component="form" onSubmit={entrar}>
              {erro && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {erro}
                </Alert>
              )}

              <TextField
                fullWidth
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                margin="normal"
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={carregando}
                sx={{ mt: 2 }}
              >
                {carregando ? 'Entrando...' : 'Entrar'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
