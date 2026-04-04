'use client'
import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export function AdminGuard({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-muted">Verificando permissões...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-muted mb-6">Você não tem permissão para acessar esta área.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-gold text-ink rounded-lg hover:bg-gold/90 transition"
          >
            Voltar à Vitrine
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
