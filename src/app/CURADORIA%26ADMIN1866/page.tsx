'use client'
import { useState, useCallback } from 'react'
import Image from 'next/image'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import ProductModal from '@/components/ProductModal'
import DashboardMetricas from '@/components/DashboardMetricas'
import { Button, Input, StatusBadge, Toast } from '@/components/ui'
import type { Anuncio } from '@/types/database'

type Tab = 'pendente' | 'ativo' | 'vendido'

function formatMoney(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

function daysLeft(dt: string | null) {
  if (!dt) return '—'
  const diff = Math.ceil((new Date(dt).getTime() - Date.now()) / 86400000)
  if (diff <= 0) return 'expirado'
  return `${diff} dia${diff !== 1 ? 's' : ''}`
}

const catLabel: Record<string, string> = {
  vestido: 'Vestido', blusa: 'Blusa', calca: 'Calça',
  casaco: 'Casaco', saia: 'Saia', conjunto: 'Conjunto', acessorio: 'Acessório',
}

function AdminPanelContent() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [tab, setTab] = useState<Tab>('pendente')
  const [anuncios, setAnuncios] = useState<Anuncio[]>([])
  const [loading, setLoading] = useState(false)
  const [counts, setCounts] = useState({ pendente: 0, ativo: 0, vendido: 0 })
  const [toast, setToast] = useState({ visible: false, msg: '' })
  const [selectedAnuncio, setSelectedAnuncio] = useState<Anuncio | null>(null)

  function showToast(msg: string) {
    setToast({ visible: true, msg })
    setTimeout(() => setToast({ visible: false, msg: '' }), 2800)
  }

  const fetchAnuncios = useCallback(async (status: Tab, adminToken: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/anuncios?status=${status}`, {
        headers: { 'x-admin-token': adminToken },
      })
      if (res.status === 401) { setLoggedIn(false); return }
      const data = await res.json()
      setAnuncios(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [])

  async function fetchAllCounts(adminToken: string) {
    const statuses: Tab[] = ['pendente', 'ativo', 'vendido']
    const results = await Promise.all(statuses.map(s =>
      fetch(`/api/admin/anuncios?status=${s}`, { headers: { 'x-admin-token': adminToken } })
        .then(r => r.json()).then(d => Array.isArray(d) ? d.length : 0)
    ))
    setCounts({ pendente: results[0], ativo: results[1], vendido: results[2] })
  }

  async function handleLogin() {
    // Simple client-side gate; real validation happens on API
    setToken(password)
    const res = await fetch('/api/admin/anuncios?status=pendente', {
      headers: { 'x-admin-token': password },
    })
    if (res.status === 401) {
      showToast('Senha incorreta')
      return
    }
    const data = await res.json()
    setAnuncios(Array.isArray(data) ? data : [])
    setLoggedIn(true)
    fetchAllCounts(password)
  }

  async function action(id: string, act: 'aprovar' | 'vendido' | 'remover') {
    const res = await fetch(`/api/admin/anuncios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ action: act }),
    })
    if (!res.ok) { showToast('Erro ao executar ação'); return }
    const msgs = { aprovar: 'Aprovado! Ativo por 30 dias', vendido: 'Marcado como vendido', remover: 'Anúncio removido' }
    showToast(msgs[act])
    fetchAnuncios(tab, token)
    fetchAllCounts(token)
  }

  function switchTab(t: Tab) {
    setTab(t)
    fetchAnuncios(t, token)
  }

  if (!loggedIn) {
    return (
      <>
        <Header />
        <main className="max-w-[480px] mx-auto px-4 pt-16 pb-28 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mx-auto mb-4 text-gold">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
          <h2 className="font-dm text-[28px] font-light mb-2">Painel Admin</h2>
          <p className="font-dm text-sm text-muted mb-8">Acesso exclusivo para gerenciar os anúncios.</p>
          <div className="max-w-[280px] mx-auto space-y-3">
            <Input label="Senha" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••" />
            <Button variant="dark" fullWidth onClick={handleLogin}>Entrar</Button>
          </div>
        </main>
        <BottomNav />
        <Toast message={toast.msg} visible={toast.visible} />
      </>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pendente', label: 'Pendentes' },
    { key: 'ativo', label: 'Ativos' },
    { key: 'vendido', label: 'Vendidos' },
  ]

  return (
    <>
      <Header />
      <main className="max-w-[480px] mx-auto px-4 pt-6 pb-28">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-dm text-2xl font-light">Painel Admin</h2>
          <Button variant="ghost" className="text-[11px] py-2 px-3"
            onClick={() => { setLoggedIn(false); setToken(''); setPassword('') }}>
            Sair
          </Button>
        </div>

        {/* Dashboard de Métricas */}
        <DashboardMetricas token={token} />        {/* Tabs */}
        <div className="flex border-b border-black/10 mb-5">
          {tabs.map(t => (
            <button key={t.key} onClick={() => switchTab(t.key)}
              className={`flex-1 py-3 font-dm text-[11px] tracking-widest uppercase relative
                border-b-2 transition-colors
                ${tab === t.key ? 'text-ink border-gold' : 'text-muted border-transparent'}`}>
              {t.label}
              {counts[t.key] > 0 && (
                <span className="ml-1 bg-gold text-ink rounded-full px-1.5 py-0.5 text-[9px] font-medium">
                  {counts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-12 text-muted font-dm text-sm">Carregando…</div>
        ) : anuncios.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mx-auto mb-3 text-muted opacity-50">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
            <p className="font-dm text-sm">Nenhum anúncio aqui</p>
          </div>
        ) : (
          <div className="space-y-3">
            {anuncios.map(a => (
              <div key={a.id} className="bg-white rounded-[2px] p-4 shadow-sm">
                <div className="flex gap-3 mb-3">
                  <div className="relative w-[70px] h-[70px] flex-shrink-0 rounded-[2px] overflow-hidden bg-warm">
                    {a.fotos?.[0] && (
                      <Image src={a.fotos[0]} alt={a.titulo} fill className="object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-dm text-[14px] font-medium truncate">{a.titulo}</p>
                    <p className="font-dm text-[11px] text-muted mt-0.5">
                      R$ {formatMoney(a.preco)} · {catLabel[a.categoria] ?? a.categoria}
                    </p>
                    <p className="font-dm text-[11px] text-muted mt-1">
                      <StatusBadge status={a.status} />
                      {' '}
                      {a.data_expiracao
                        ? <span className="text-[10px]">Expira em {daysLeft(a.data_expiracao)}</span>
                        : <span className="text-[10px]">{new Date(a.created_at).toLocaleDateString('pt-BR')}</span>
                      }
                    </p>
                  </div>
                </div>

                {a.vendedor_whatsapp && (
                  <a href={`https://wa.me/${(() => { const d = a.vendedor_whatsapp.replace(/\D/g, ''); return d.startsWith('55') ? d : '55' + d; })()}`}
                    target="_blank" rel="noopener noreferrer"
                    className="font-dm text-[10px] text-[#25D366] inline-flex items-center gap-1 hover:text-[#20bd5a] transition-colors mb-3">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.89 21 3 13.11 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                    {a.vendedor_whatsapp}
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedAnuncio(a)}
                  style={{ display: 'block', width: '100%', padding: '10px 0', marginBottom: '10px', backgroundColor: 'rgba(201,169,110,0.2)', color: '#C9A96E', border: '1px solid rgba(201,169,110,0.3)', borderRadius: '2px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  👁 VER DETALHES
                </button>

                <div className="flex gap-1.5">
                    {tab === 'pendente' && (
                      <>
                        <button onClick={() => action(a.id, 'aprovar')}
                          className="flex-1 py-1.5 bg-green-500 text-white rounded-[2px]
                            font-dm text-[10px] font-medium tracking-wide uppercase
                            hover:opacity-80 transition-opacity">
                          ✓ Aprovar
                        </button>
                        <button onClick={() => action(a.id, 'remover')}
                          className="flex-1 py-1.5 bg-red-500 text-white rounded-[2px]
                            font-dm text-[10px] font-medium tracking-wide uppercase
                            hover:opacity-80 transition-opacity">
                          Remover
                        </button>
                      </>
                    )}
                    {tab === 'ativo' && (
                      <>
                        <button onClick={() => action(a.id, 'vendido')}
                          className="flex-1 py-1.5 bg-ink text-cream rounded-[2px]
                            font-dm text-[10px] font-medium tracking-wide uppercase
                            hover:opacity-80 transition-opacity">
                          Vendido
                        </button>
                        <button onClick={() => action(a.id, 'remover')}
                          className="flex-1 py-1.5 bg-red-500 text-white rounded-[2px]
                            font-dm text-[10px] font-medium tracking-wide uppercase
                            hover:opacity-80 transition-opacity">
                          Remover
                        </button>
                      </>
                    )}
                    {tab === 'vendido' && (
                      <button onClick={() => action(a.id, 'remover')}
                        className="flex-1 py-1.5 bg-red-500 text-white rounded-[2px]
                          font-dm text-[10px] font-medium tracking-wide uppercase
                          hover:opacity-80 transition-opacity">
                        Excluir
                      </button>
                    )}
                  </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <ProductModal anuncio={selectedAnuncio} onClose={() => setSelectedAnuncio(null)} hideWhatsApp />
      <BottomNav />
      <Toast message={toast.msg} visible={toast.visible} />
    </>
  )
}

export default function AdminPage() {
  return <AdminPanelContent />
}
