import { NextResponse } from 'next/server'
import { getAnuncios, addAnuncio } from '@/lib/db'

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

    const { titulo, descricao, preco, categoria, vendedor_nome, vendedor_sobrenome,
            vendedor_whatsapp, fotos, tamanho, regras_aceitas, cidade, estado } = body

    if (!titulo || !preco || !categoria || !vendedor_whatsapp || !cidade || !estado || !vendedor_nome || !vendedor_sobrenome) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    if (!fotos || !Array.isArray(fotos) || fotos.length < 4) {
      return NextResponse.json({ error: 'Envie ao menos 4 fotos ou vídeos' }, { status: 400 })
    }

    const newAnuncio = await addAnuncio({
      titulo,
      descricao: descricao || null,
      preco: Number(preco),
      categoria,
      vendedor_nome: vendedor_nome.trim(),
      vendedor_sobrenome: vendedor_sobrenome.trim(),
      vendedor_whatsapp: vendedor_whatsapp.replace(/\D/g, ''),
      fotos: fotos || [],
      status: 'pendente',
      data_expiracao: null,
      tamanho: tamanho || '',
      regras_aceitas: !!regras_aceitas,
      cidade,
      estado: estado.toUpperCase(),
    })

    return NextResponse.json(newAnuncio, { status: 201 })
  } catch (err) {
    console.error('[API ERROR] POST /api/anuncios:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro desconhecido' }, { status: 500 })
  }
}
