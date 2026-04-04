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
  tamanho: string[] // Array com tamanhos selecionados: 'P', 'M', 'G', 'GG'
  regras_aceitas: boolean
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
  medida_busto?: number
  medida_cintura?: number
  medida_quadril?: number
  medida_comprimento?: number
  fotos: File[]
}
