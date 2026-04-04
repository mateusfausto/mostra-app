'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

export function AuthDebug() {
  const { isAdmin, loading, user } = useAuth()
  const [showTooltip, setShowTooltip] = useState(false)

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="relative">
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-green-400 font-bold text-sm hover:bg-gray-800 transition"
          title="Status de autenticação"
        >
          {loading ? '⏳' : isAdmin ? '✅' : '❌'}
        </button>

        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-2 bg-black text-green-400 text-xs font-mono rounded p-2 whitespace-nowrap border border-green-400/30">
            <div>Admin: {isAdmin ? 'Sim' : 'Não'}</div>
            <div>Email: {user?.email || 'nenhum'}</div>
          </div>
        )}
      </div>
    </div>
  )
}
