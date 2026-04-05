export type AnuncioStatus = 'pendente' | 'ativo' | 'vendido' | 'removido'

export interface Anuncio {
  id: string
  created_at: string
  vendedor_whatsapp: string
  titulo: string
  descricao: string | null
  preco: number
  fotos: string[]
  categoria: string
  status: AnuncioStatus
  data_expiracao: string | null
  tamanho: string // Tamanho único: 'PP', 'P', 'M', 'G', 'GG', 'XG', '36'-'46'
  regras_aceitas: boolean
  cidade: string
  estado: string
}

export interface Database {
  public: {
    Tables: {
      anuncios: {
        Row: Anuncio
        Insert: Omit<Anuncio, 'id' | 'created_at'>
        Update: Partial<Omit<Anuncio, 'id' | 'created_at'>>
      }
    }
  }
}

export interface AnuncioFormData {
  titulo: string
  descricao: string
  preco: number
  categoria: string
  vendedor_whatsapp: string
  cidade: string
  estado: string
  tamanho: string
  regras_aceitas: boolean
  fotos: File[]
}
