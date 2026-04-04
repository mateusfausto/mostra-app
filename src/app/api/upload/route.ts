import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const formData = await request.formData()
  const files = formData.getAll('files') as File[]

  if (!files.length) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
  }

  const urls: string[] = []

  for (const file of files.slice(0, 6)) {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Converte para base64
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`
    
    urls.push(dataUrl)
  }

  return NextResponse.json({ urls })
}
