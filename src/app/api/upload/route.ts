import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const MAX_PHOTO_SIZE = 5 * 1024 * 1024   // 5 MB
const MAX_VIDEO_SIZE = 25 * 1024 * 1024  // 25 MB

function isVideoType(type: string) {
  return type.startsWith('video/')
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files.length) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    const urls: string[] = []

    for (const file of files.slice(0, 6)) {
      const maxSize = isVideoType(file.type) ? MAX_VIDEO_SIZE : MAX_PHOTO_SIZE
      if (file.size > maxSize) {
        const limitMB = Math.round(maxSize / 1024 / 1024)
        return NextResponse.json(
          { error: `Arquivo "${file.name}" excede o limite de ${limitMB}MB` },
          { status: 400 }
        )
      }

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Converte para base64
      const base64 = buffer.toString('base64')
      const dataUrl = `data:${file.type};base64,${base64}`

      urls.push(dataUrl)
    }

    return NextResponse.json({ urls })
  } catch (err) {
    console.error('[UPLOAD ERROR]', err)
    return NextResponse.json(
      { error: 'Erro ao processar upload. O arquivo pode ser grande demais.' },
      { status: 500 }
    )
  }
}
