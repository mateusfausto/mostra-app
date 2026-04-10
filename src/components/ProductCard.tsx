'use client'
import Image from 'next/image'
import type { Anuncio } from '@/types/database'

const catLabel: Record<string, string> = {
  vestido: 'Vestido', blusa: 'Blusa', calca: 'Calça',
  casaco: 'Casaco', saia: 'Saia', conjunto: 'Conjunto', acessorio: 'Acessório',
}

function formatMoney(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

function isVideo(url: string): boolean {
  if (url.startsWith('data:video/')) return true
  const ext = url.toLowerCase().split('?')[0].split('.').pop()
  return ext === 'mp4' || ext === 'webm' || ext === 'mov' || ext === 'avi'
}

interface Props {
  anuncio: Anuncio
  onClick: (a: Anuncio) => void
  delay?: number
}

export default function ProductCard({ anuncio, onClick, delay = 0 }: Props) {
  function handleInterest(e: React.MouseEvent) {
    e.stopPropagation()
    const rawPhone = anuncio.vendedor_whatsapp.replace(/\D/g, '')
    const phone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`
    const msg = encodeURIComponent(`Olá, vi seu anúncio *${anuncio.titulo}* na vitrine da MOSTRALY e quero comprar! 😍`)
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
  }

  function handleShare(e: React.MouseEvent) {
    e.stopPropagation()
    const url = window.location.origin
    const text = `${anuncio.titulo} - R$ ${formatMoney(anuncio.preco)} na MOSTRALY!`
    if (navigator.share) {
      navigator.share({ title: anuncio.titulo, text, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(`${text} ${url}`)
    }
  }

  const fallback = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&q=80'
  // Preferir primeira foto (imagem) para thumbnail; se todas forem vídeo, usar o primeiro vídeo
  const firstImage = anuncio.fotos?.find(f => !isVideo(f))
  const firstVideo = anuncio.fotos?.find(f => isVideo(f))
  const foto = firstImage ?? firstVideo ?? fallback
  const fotoIsVideo = isVideo(foto)

  return (
    <article
      className="bg-white rounded-[2px] overflow-hidden cursor-pointer
        shadow-sm hover:-translate-y-1 hover:shadow-lg
        transition-all duration-300 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => onClick(anuncio)}
    >
      {/* Image / Video thumbnail */}
      <div className="relative aspect-[3/4] overflow-hidden bg-warm">
        {fotoIsVideo ? (
          <>
            <video
              src={foto}
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
            {/* Ícone de play sobre o vídeo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </>
        ) : (
          <Image
            src={foto}
            alt={anuncio.titulo}
            fill
            sizes="(max-width: 480px) 50vw, 240px"
            className="object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallback
            }}
          />
        )}
        <div className="absolute top-2 left-2 bg-ink text-cream
          font-dm text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-[2px]">
          {catLabel[anuncio.categoria] ?? anuncio.categoria}
        </div>
      </div>

      {/* Body */}
      <div className="p-3">        
        <div className="flex items-start justify-between gap-1.5 mb-2">
          <h3 className="font-cormorant text-[15px] font-normal leading-snug text-ink
            line-clamp-2 flex-1">
            {anuncio.titulo}
          </h3>
          <button
            onClick={handleShare}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-muted hover:text-ink transition-colors mt-0.5"
            title="Compartilhar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
            </svg>
          </button>
        </div>
        <p className="font-dm text-base font-medium text-ink mb-2.5">
          R$ {formatMoney(anuncio.preco)}
        </p>
        <button
          onClick={handleInterest}
          className="w-full py-2.5 bg-ink text-cream
            font-dm text-[11px] font-medium tracking-widest uppercase
            rounded-[2px] transition-colors hover:bg-[#25D366]"
        >
          Quero
        </button>
      </div>
    </article>
  )
}
