'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isAdmin: boolean
  loading: boolean
  user: any
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAdminStatus()

    // Simula listener de auth
    const handleStorageChange = () => {
      checkAdminStatus()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const checkAdminStatus = async () => {
    try {
      // Em desenvolvimento, verifica email mockado
      const devEmail = process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL
      const emailToCheck = devEmail

      if (!emailToCheck) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      // Verifica se o email está na lista de admins
      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim())
      const isAdminUser = adminEmails.includes(emailToCheck)

      setIsAdmin(isAdminUser)
      setUser({ email: emailToCheck })

      // Log em dev para debug
      if (process.env.NODE_ENV === 'development') {
        console.log('[AUTH DEBUG]', {
          devEmail: devEmail || 'não configurado',
          isAdmin: isAdminUser,
          adminList: adminEmails,
        })
      }
    } catch (error) {
      console.error('Erro ao verificar status de admin:', error)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ isAdmin, loading, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
