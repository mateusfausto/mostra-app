import { NextResponse } from 'next/server'
import { getAnuncios } from '@/lib/db'

function checkAdmin(request: Request) {
  const auth = request.headers.get('x-admin-token')
  return auth === process.env.ADMIN_PASSWORD
}

export async function GET(request: Request) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const anuncios = await getAnuncios()

    // Calcular métricas
    const totalPendentes = anuncios.filter(a => a.status === 'pendente').length
    const totalAtivos = anuncios.filter(a => a.status === 'ativo').length
    const totalVendidos = anuncios.filter(a => a.status === 'vendido').length
    const totalRemovidos = anuncios.filter(a => a.status === 'removido').length

    // Receita = taxa por anúncio × total de anúncios ativos (já pagaram R$30)
    const taxaAnuncio = Number(process.env.NEXT_PUBLIC_TAXA_ANUNCIO) || 30
    const receita = totalAtivos * taxaAnuncio

    // Taxa de conversão
    const taxaConversao = anuncios.length > 0
      ? ((totalVendidos / anuncios.length) * 100).toFixed(1)
      : '0'

    // Anúncios do mês
    const agora = new Date()
    const mesPassado = new Date(agora.setMonth(agora.getMonth() - 1))
    const anunciosMes = anuncios.filter(a => new Date(a.created_at) > mesPassado).length

    return NextResponse.json({
      totais: {
        anuncios: anuncios.length,
        pendentes: totalPendentes,
        ativos: totalAtivos,
        vendidos: totalVendidos,
        removidos: totalRemovidos,
      },
      metricas: {
        receita: receita.toFixed(2),
        taxaConversao: parseFloat(taxaConversao),
        anunciosMes,
      },
    })
  } catch (error) {
    console.error('[API ERROR] GET /api/admin/metricas:', error)
    return NextResponse.json({ error: 'Erro ao calcular métricas' }, { status: 500 })
  }
}
