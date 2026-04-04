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

interface Props {
  anuncio: Anuncio
  onClick: (a: Anuncio) => void
  delay?: number
}

export default function ProductCard({ anuncio, onClick, delay = 0 }: Props) {
  function handleInterest(e: React.MouseEvent) {
    e.stopPropagation()
    const phone = anuncio.vendedor_whatsapp.replace(/\D/g, '')
    const msg = encodeURIComponent(`Olá, vi seu *${anuncio.titulo}* na vitrine e quero comprar! 😍`)
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
  }

  const foto = anuncio.fotos?.[0] ?? 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&q=80'

  return (
    <article
      className="bg-white rounded-[2px] overflow-hidden cursor-pointer
        shadow-sm hover:-translate-y-1 hover:shadow-lg
        transition-all duration-300 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => onClick(anuncio)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-warm">
        <Image
          src={foto}
          alt={anuncio.titulo}
          fill
          sizes="(max-width: 480px) 50vw, 240px"
          className="object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&q=80'
          }}
        />
        <div className="absolute top-2 left-2 bg-ink text-cream
          font-dm text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-[2px]">
          {catLabel[anuncio.categoria] ?? anuncio.categoria}
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        <p className="font-dm text-[10px] tracking-[0.15em] uppercase text-gold mb-1">
          {catLabel[anuncio.categoria] ?? anuncio.categoria}
        </p>
        <h3 className="font-cormorant text-[15px] font-normal leading-snug text-ink mb-2
          line-clamp-2">
          {anuncio.titulo}
        </h3>
        <p className="font-dm text-base font-medium text-ink mb-2.5">
          R$ {formatMoney(anuncio.preco)}
        </p>
        <button
          onClick={handleInterest}
          className="w-full py-2.5 bg-ink text-cream
            font-dm text-[11px] font-medium tracking-widest uppercase
            rounded-[2px] transition-colors hover:bg-[#25D366]"
        >
          Tenho interesse
        </button>
      </div>
    </article>
  )
}
