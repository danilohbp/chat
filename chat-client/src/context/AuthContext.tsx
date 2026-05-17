import { createContext } from 'react'

export interface Usuario {
  id: string
  nome: string
  email: string
}

export interface AuthContextData {
  usuario: Usuario | null
  token: string | null
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextData | null>(null)
