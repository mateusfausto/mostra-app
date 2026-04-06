'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { Anuncio } from '@/types/database'

const catLabel: Record<string, string> = {
  vestido: 'Vestido', blusa: 'Blusa', calca: 'Calça',
  casaco: 'Casaco', saia: 'Saia', conjunto: 'Conjunto', acessorio: 'Acessório',
}

function isVideo(url: string): boolean {
  // Detectar data URLs de vídeo (base64)
  if (url.startsWith('data:video/')) return true
  // Detectar por extensão (URLs externas)
  const ext = url.toLowerCase().split('?')[0].split('.').pop()
  return ext === 'mp4' || ext === 'webm' || ext === 'mov' || ext === 'avi'
}

function formatMoney(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

function daysLeft(dt: string | null) {
  if (!dt) return '—'
  const diff = Math.ceil((new Date(dt).getTime() - Date.now()) / 86400000)
  if (diff <= 0) return 'expirado'
  return `${diff} dia${diff !== 1 ? 's' : ''}`
}

interface Props {
  anuncio: Anuncio | null
  onClose: () => void
  hideWhatsApp?: boolean
}

export default function ProductModal({ anuncio, onClose, hideWhatsApp = false }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (!anuncio) return
    const favs = JSON.parse(localStorage.getItem('favoritos') || '[]')
    setIsFavorite(favs.includes(anuncio.id))
  }, [anuncio])

  if (!anuncio) return null

  const fotos = anuncio.fotos && anuncio.fotos.length > 0 
    ? anuncio.fotos 
    : ['https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80']
  
  const currentFoto = fotos[currentImageIndex]
  const rawPhone = anuncio.vendedor_whatsapp.replace(/\D/g, '')
  const phone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`
  const msg = encodeURIComponent(`Olá, vi seu *${anuncio?.titulo}* na vitrine e quero comprar! 😍`)
  const waLink = `https://wa.me/${phone}?text=${msg}`

  const temTamanho = anuncio?.tamanho && anuncio.tamanho.length > 0 // works for string too

  function toggleFavorite() {
    if (!anuncio) return
    const favs = JSON.parse(localStorage.getItem('favoritos') || '[]')
    if (isFavorite) {
      const newFavs = favs.filter((id: string) => id !== anuncio.id)
      localStorage.setItem('favoritos', JSON.stringify(newFavs))
    } else {
      favs.push(anuncio.id)
      localStorage.setItem('favoritos', JSON.stringify(favs))
    }
    setIsFavorite(!isFavorite)
  }

  function nextImage() {
    setCurrentImageIndex((prev) => (prev + 1) % fotos.length)
  }

  function prevImage() {
    setCurrentImageIndex((prev) => (prev - 1 + fotos.length) % fotos.length)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-ink/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[480px] mx-auto bg-white rounded-t-2xl
        max-h-[92vh] overflow-y-auto animate-slide-up">
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-black/15 mx-auto mt-3" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-0">
          <span className="font-dm text-[11px] tracking-[0.2em] uppercase text-gold">
            {catLabel[anuncio.categoria] ?? anuncio.categoria}
          </span>
          <div className="flex gap-2">
            <button
              onClick={toggleFavorite}
              className="w-8 h-8 rounded-full bg-warm flex items-center justify-center
                hover:bg-warm/80 transition-colors"
              title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} 
                stroke="currentColor" strokeWidth={isFavorite ? 0 : 1.5}
                className={isFavorite ? 'text-red-400' : 'text-muted'}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-warm flex items-center justify-center
                font-dm text-muted text-sm hover:bg-warm/80 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-5 pb-8">
          {/* Gallery com Carrossel */}
          <div className="relative aspect-[4/5] rounded-[2px] overflow-hidden bg-warm mt-3 mb-4">
            {isVideo(currentFoto) ? (
              <video
                src={currentFoto}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={currentFoto}
                alt={anuncio.titulo}
                fill
                sizes="480px"
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80'
                }}
              />
            )}
            
            {fotos.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white
                    rounded-full flex items-center justify-center transition-all z-10"
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white
                    rounded-full flex items-center justify-center transition-all z-10"
                >
                  ›
                </button>

                {/* Indicadores */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {fotos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Info */}
          <h2 className="font-cormorant text-[26px] font-light leading-tight text-ink mb-3">
            {anuncio.titulo}
          </h2>
          <p className="font-dm text-2xl font-medium text-ink mb-1">
            R$ {formatMoney(anuncio.preco)}
          </p>
          <p className="font-dm text-xs text-muted mb-4">
            {anuncio.cidade}, {anuncio.estado}
          </p>

          {anuncio.descricao && (
            <p className="font-dm text-sm leading-relaxed text-muted mb-4">
              {anuncio.descricao}
            </p>
          )}

          {/* Tamanho */}
          {temTamanho && (
            <div className="mb-4">
              <p className="font-dm text-[10px] tracking-widest uppercase text-muted mb-2">Tamanho</p>
              <span className="inline-flex items-center justify-center px-3 h-8 border border-gold/40 text-ink font-dm font-medium text-sm rounded">
                {anuncio.tamanho}
              </span>
            </div>
          )}

          <div className="h-px bg-black/8 mb-5" />

          {/* CTA */}
          {!hideWhatsApp && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="
                w-full flex items-center justify-center gap-2
                py-4 bg-[#25D366] text-white rounded-[2px]
                font-dm text-sm font-medium tracking-wider uppercase
                hover:bg-[#20bd5a] transition-colors
              "
            >
              Tenho interesse! Chamar no WhatsApp
            </a>
          )}

          <p className="text-center font-dm text-[11px] text-muted mt-3">
            Anúncio expira em {daysLeft(anuncio.data_expiracao)}
          </p>
        </div>
      </div>
    </div>
  )
}
