'use client'
import { useState, useEffect } from 'react'

interface Metricas {
  totais: {
    anuncios: number
    pendentes: number
    ativos: number
    vendidos: number
    removidos: number
  }
  metricas: {
    receita: string
    taxaConversao: number
    anunciosMes: number
  }
}

interface Props {
  token: string
}

export default function DashboardMetricas({ token }: Props) {
  const [metricas, setMetricas] = useState<Metricas | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetricas()
  }, [token])

  async function fetchMetricas() {
    try {
      const res = await fetch('/api/admin/metricas', {
        headers: { 'x-admin-token': token },
      })
      if (!res.ok) return
      const data = await res.json()
      setMetricas(data)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-4 text-muted text-sm">Carregando métricas...</div>
  if (!metricas) return null

  const { totais, metricas: m } = metricas

  return (
    <div className="mb-6">
      <h3 className="font-cormorant text-xl font-light mb-4">Dashboard de Métricas</h3>

      {/* Cards principais */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <p className="font-dm text-[11px] tracking-widest uppercase text-green-700 mb-1">Receita Total</p>
          <p className="font-cormorant text-2xl font-light text-green-900">
            R$ {Number(m.receita).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="font-dm text-xs text-green-600 mt-1">{totais.ativos} anúncios ativos × R$30</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
          <p className="font-dm text-[11px] tracking-widest uppercase text-blue-700 mb-1">Taxa de Conversão</p>
          <p className="font-cormorant text-2xl font-light text-blue-900">{m.taxaConversao}%</p>
          <p className="font-dm text-xs text-blue-600 mt-1">de {totais.anuncios} anúncios</p>
        </div>
      </div>

      {/* Status dos anúncios */}
      <div className="bg-cream rounded-lg p-4 mb-4">
        <p className="font-dm text-[11px] tracking-widest uppercase text-muted mb-3">Status dos Anúncios</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="font-dm text-sm">Pendentes</span>
            </div>
            <span className="font-dm font-medium">{totais.pendentes}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="font-dm text-sm">Ativos</span>
            </div>
            <span className="font-dm font-medium">{totais.ativos}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="font-dm text-sm">Vendidos</span>
            </div>
            <span className="font-dm font-medium">{totais.vendidos}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="font-dm text-sm">Removidos</span>
            </div>
            <span className="font-dm font-medium">{totais.removidos}</span>
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
        <p className="font-dm text-[11px] tracking-widest uppercase text-muted mb-2">Este Mês</p>
        <p className="font-cormorant text-lg font-light">
          <span className="text-gold font-medium">{m.anunciosMes}</span> novos anúncios
        </p>
      </div>
    </div>
  )
}
