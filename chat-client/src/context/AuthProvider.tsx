import { useState } from 'react'
import { AuthContext, type Usuario } from './AuthContext'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

interface LoginResponse {
  token: string
  usuario: Usuario
}

function carregarUsuarioSalvo() {
  const usuarioSalvo = localStorage.getItem('usuario')

  if (!usuarioSalvo) return null

  try {
    return JSON.parse(usuarioSalvo) as Usuario
  } catch {
    localStorage.removeItem('usuario')
    localStorage.removeItem('token')
    return null
  }
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    return carregarUsuarioSalvo()
  })

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token')
  })

  const login = async (email: string, senha: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, senha }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.message ?? 'Nao foi possivel entrar.')
    }

    const data = (await response.json()) as LoginResponse

    localStorage.setItem('usuario', JSON.stringify(data.usuario))
    localStorage.setItem('token', data.token)

    setUsuario(data.usuario)
    setToken(data.token)
  }

  const logout = () => {
    localStorage.removeItem('usuario')
    localStorage.removeItem('token')
    setUsuario(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
