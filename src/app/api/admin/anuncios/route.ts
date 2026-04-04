import { NextResponse } from 'next/server'
import { getAnuncios } from '@/lib/database'

function checkAdmin(request: Request) {
  const auth = request.headers.get('x-admin-token')
  return auth === process.env.ADMIN_PASSWORD
}

export async function GET(request: Request) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'ativo'

  let anuncios = await getAnuncios()
  
  if (status) {
    anuncios = anuncios.filter(a => a.status === status)
  }
  
  return NextResponse.json(anuncios)
}
