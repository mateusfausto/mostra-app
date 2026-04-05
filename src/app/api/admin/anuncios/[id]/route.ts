import { NextResponse } from 'next/server'
import { updateAnuncio, deleteAnuncio } from '@/lib/db'

function checkAdmin(request: Request) {
  const auth = request.headers.get('x-admin-token')
  return auth === process.env.ADMIN_PASSWORD
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const { action } = body
  const id = params.id

  let updateData: Record<string, unknown> = {}

  if (action === 'aprovar') {
    const expiracao = new Date()
    expiracao.setDate(expiracao.getDate() + 30)
    updateData = { status: 'ativo', data_expiracao: expiracao.toISOString() }
  } else if (action === 'vendido') {
    updateData = { status: 'vendido' }
  } else if (action === 'remover') {
    updateData = { status: 'removido' }
  } else {
    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  }

  const updated = await updateAnuncio(id, updateData as any)
  
  if (!updated) {
    return NextResponse.json({ error: 'Anúncio não encontrado' }, { status: 404 })
  }
  
  return NextResponse.json(updated)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  await deleteAnuncio(params.id)
  return NextResponse.json({ success: true })
}
