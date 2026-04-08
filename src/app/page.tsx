'use client'
import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import ProductCard from '@/components/ProductCard'
import ProductModal from '@/components/ProductModal'
import { SkeletonCard, Toast } from '@/components/ui'
import type { Anuncio } from '@/types/database'

const CATEGORIAS = [
  { value: 'todos', label: 'Todos' },
  { value: 'vestido', label: 'Vestidos' },
  { value: 'blusa', label: 'Blusas' },
  { value: 'calca', label: 'Calças' },
  { value: 'casaco', label: 'Casacos' },
  { value: 'saia', label: 'Saias' },
  { value: 'conjunto', label: 'Conjuntos' },
  { value: 'acessorio', label: 'Acessórios' },
]

export default function HomePage() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([])
  const [loading, setLoading] = useState(true)
  const [categoria, setCategoria] = useState('todos')
  const [busca, setBusca] = useState('')
  const [selected, setSelected] = useState<Anuncio | null>(null)
  const [toast, setToast] = useState({ visible: false, msg: '' })

  const fetchAnuncios = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (categoria !== 'todos') params.set('categoria', categoria)
    if (busca) params.set('busca', busca)

    try {
      const res = await fetch(`/api/anuncios?${params}`)
      const data = await res.json()
      setAnuncios(Array.isArray(data) ? data : [])
    } catch {
      showToast('Erro ao carregar anúncios')
    } finally {
      setLoading(false)
    }
  }, [categoria, busca])

  useEffect(() => {
    const timer = setTimeout(fetchAnuncios, busca ? 400 : 0)
    return () => clearTimeout(timer)
  }, [fetchAnuncios, busca])

  function showToast(msg: string) {
    setToast({ visible: true, msg })
    setTimeout(() => setToast({ visible: false, msg: '' }), 2800)
  }

  return (
    <>
      <Header />

      <main className="min-h-screen pb-20">
        {/* Hero */}
        <section className="bg-ink relative overflow-hidden px-4 pt-12 pb-9">
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(201,169,110,0.15) 0%, transparent 70%)' }}
          />
          <div className="max-w-[480px] mx-auto relative">
            <p className="font-dm text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
              ✦ Curadoria exclusiva
            </p>
            <h1 className="font-cormorant text-5xl font-light leading-[1.08] text-cream">
              Peças que<br />merecem um{' '}
              <em className="italic text-gold-light">novo lar</em>
            </h1>
            <p className="mt-4 font-dm text-[13px] font-light leading-relaxed text-cream/60 max-w-[280px]">
              Vitrine montada com cuidado, alta qualidade e preços justos.
            </p>
            <div className="mt-7 flex gap-3 flex-wrap">
              <a href="/anunciar"
                className="btn-gold inline-flex items-center gap-2
                  px-5 py-3 bg-gold text-ink rounded-[2px]
                  font-dm text-xs font-medium tracking-widest uppercase
                  hover:bg-gold-light transition-colors">
                Anunciar peça
              </a>
              <button
                onClick={() => document.getElementById('vitrine-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2
                  px-5 py-3 bg-transparent text-cream rounded-[2px]
                  border border-white/30
                  font-dm text-xs font-medium tracking-widest uppercase
                  hover:border-gold hover:text-gold transition-colors">
                Ver peças
              </button>
            </div>
          </div>
        </section>

        {/* Search + Filters */}
        <div className="px-4 pt-4 pb-0 max-w-[480px] mx-auto">
          <div className="relative mb-3">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="search"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar peças…"
              className="w-full pl-10 pr-4 py-3 bg-white border border-black/10 rounded-[2px]
                font-dm text-sm text-ink outline-none focus:border-gold
                placeholder:text-muted transition-colors"
            />
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {CATEGORIAS.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategoria(cat.value)}
                className={`
                  flex-shrink-0 px-3.5 py-1.5 rounded-full border
                  font-dm text-xs tracking-[0.05em] whitespace-nowrap
                  transition-all duration-200
                  ${categoria === cat.value
                    ? 'bg-ink text-cream border-ink'
                    : 'bg-white text-muted border-black/10 hover:border-ink/30'
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div id="vitrine-grid" className="max-w-[480px] mx-auto">
          <div className="flex items-baseline justify-between px-4 pt-6 pb-4">
            <h2 className="font-cormorant text-[22px] font-light">Vitrine</h2>
            <span className="font-dm text-xs text-muted">
              {loading ? '…' : `${anuncios.length} peça${anuncios.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 px-4">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : anuncios.length === 0
                ? (
                  <div className="col-span-2 text-center py-16 text-muted">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mx-auto mb-3 text-gold">
                      <path d="M16 2H8c-1.1 0-2 .9-2 2v14H4v2h16v-2h-2V4c0-1.1-.9-2-2-2zm-2 14H10V4h4v12z"/>
                    </svg>
                    <p className="font-dm text-sm">Nenhuma peça encontrada</p>
                  </div>
                )
                : anuncios.map((a, i) => (
                  <ProductCard
                    key={a.id}
                    anuncio={a}
                    onClick={setSelected}
                    delay={i * 60}
                  />
                ))
            }
          </div>
        </div>
      </main>

      <BottomNav />

      {selected && (
        <ProductModal anuncio={selected} onClose={() => setSelected(null)} />
      )}

      <Toast message={toast.msg} visible={toast.visible} />
    </>
  )
}
