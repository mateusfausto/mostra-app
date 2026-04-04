import { NextResponse } from 'next/server'
import { getAnuncios, addAnuncio } from '@/lib/database'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoria = searchParams.get('categoria')
  const busca = searchParams.get('busca')

  let anuncios = await getAnuncios()

  // Filtrar por status ativo
  anuncios = anuncios.filter(a => a.status === 'ativo')

  // Filtrar por categoria
  if (categoria && categoria !== 'todos') {
    anuncios = anuncios.filter(a => a.categoria === categoria)
  }

  // Buscar por título/descrição
  if (busca) {
    const buscaLower = busca.toLowerCase()
    anuncios = anuncios.filter(a =>
      a.titulo.toLowerCase().includes(buscaLower) ||
      (a.descricao && a.descricao.toLowerCase().includes(buscaLower))
    )
  }

  return NextResponse.json(anuncios)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { titulo, descricao, preco, categoria, vendedor_whatsapp,
            fotos, tamanho, regras_aceitas } = body

    if (!titulo || !preco || !categoria || !vendedor_whatsapp) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    const newAnuncio = await addAnuncio({
      titulo,
      descricao: descricao || null,
      preco: Number(preco),
      categoria,
      vendedor_whatsapp: vendedor_whatsapp.replace(/\D/g, ''),
      fotos: fotos || [],
      status: 'pendente',
      data_expiracao: null,
      tamanho: tamanho || [],
      regras_aceitas: !!regras_aceitas,
    })

    return NextResponse.json(newAnuncio, { status: 201 })
  } catch (err) {
    console.error('[API ERROR] POST /api/anuncios:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro desconhecido' }, { status: 500 })
  }
}
