'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import ProductCard from '@/components/ProductCard'
import ProductModal from '@/components/ProductModal'
import { Toast } from '@/components/ui'
import type { Anuncio } from '@/types/database'

export default function FavoritosPage() {
  const [favoritos, setFavoritos] = useState<Anuncio[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Anuncio | null>(null)
  const [toast, setToast] = useState({ visible: false, msg: '' })

  useEffect(() => {
    loadFavoritos()
  }, [])

  async function loadFavoritos() {
    setLoading(true)
    try {
      const favIds = JSON.parse(localStorage.getItem('favoritos') || '[]')
      if (favIds.length === 0) {
        setFavoritos([])
        setLoading(false)
        return
      }

      // Busca todos os anúncios ativos
      const res = await fetch('/api/anuncios')
      const allAnuncios = await res.json()

      // Filtra apenas os que estão em favoritos
      const favAnuncios = Array.isArray(allAnuncios)
        ? allAnuncios.filter((a: Anuncio) => favIds.includes(a.id))
        : []

      setFavoritos(favAnuncios)
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error)
      setToast({ visible: true, msg: '❌ Erro ao carregar favoritos' })
    } finally {
      setLoading(false)
    }
  }

  function handleRemoveFavorito(id: string) {
    const favIds = JSON.parse(localStorage.getItem('favoritos') || '[]')
    const newFavIds = favIds.filter((fid: string) => fid !== id)
    localStorage.setItem('favoritos', JSON.stringify(newFavIds))
    setFavoritos(favoritos.filter(f => f.id !== id))
    setToast({ visible: true, msg: '🗑️ Removido dos favoritos' })
    setTimeout(() => setToast({ visible: false, msg: '' }), 2000)
  }

  return (
    <>
      <Header />
      <main className="max-w-[480px] mx-auto px-4 pt-6 pb-28">
        <h1 className="font-cormorant text-[32px] font-light mb-2">Favoritos</h1>
        <p className="font-dm text-sm text-muted mb-6">Peças que você salvou para depois</p>

        {loading ? (
          <div className="text-center py-12 text-muted">Carregando...</div>
        ) : favoritos.length === 0 ? (
          <div className="text-center py-16">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mx-auto mb-3 text-red-400">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <p className="font-dm text-sm text-muted">Você ainda não tem favoritos</p>
            <p className="font-dm text-xs text-muted mt-1">Clique no coração no modal para salvar peças</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {favoritos.map(fav => (
              <div key={fav.id} className="relative group">
                <ProductCard anuncio={fav} onClick={() => setSelected(fav)} />
                <button
                  onClick={() => handleRemoveFavorito(fav.id)}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500/90 hover:bg-red-600 rounded-full
                    flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100
                    transition-opacity z-10"
                  title="Remover dos favoritos"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
      <ProductModal anuncio={selected} onClose={() => setSelected(null)} />
      <Toast message={toast.msg} visible={toast.visible} />
    </>
  )
}
