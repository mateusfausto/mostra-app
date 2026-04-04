// database.ts - Compatibilidade com código antigo
// DESCONTINUADO: Use src/lib/db.ts em vez disso
// Este arquivo redireciona para db.ts para manter compatibilidade

import fs from 'fs'
import path from 'path'
import type { Anuncio } from '@/types/database'

// Garante que só roda no servidor
if (typeof window !== 'undefined') {
  throw new Error('database.ts só pode ser usado no servidor!')
}

const DB_DIR = path.join(process.cwd(), '.db')
const DB_FILE = path.join(DB_DIR, 'anuncios.json')

function ensureDbFile() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true })
  }
  
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ anuncios: [] }, null, 2))
  }
}

function readDB(): { anuncios: Anuncio[] } {
  try {
    ensureDbFile()
    const data = fs.readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (e) {
    console.error('Erro ao ler banco:', e)
    return { anuncios: [] }
  }
}

function writeDB(data: { anuncios: Anuncio[] }) {
  try {
    ensureDbFile()
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.error('Erro ao escrever banco:', e)
  }
}

export async function getAnuncios(): Promise<Anuncio[]> {
  const db = readDB()
  return db.anuncios.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export async function getAnuncioById(id: string): Promise<Anuncio | null> {
  const db = readDB()
  return db.anuncios.find(a => a.id === id) || null
}

export async function addAnuncio(anuncio: Omit<Anuncio, 'id' | 'created_at'>): Promise<Anuncio> {
  const db = readDB()
  const id = Math.random().toString(36).substring(2) + Date.now().toString(36)
  const now = new Date().toISOString()

  const newAnuncio: Anuncio = {
    ...anuncio,
    id,
    created_at: now,
  } as Anuncio

  db.anuncios.push(newAnuncio)
  writeDB(db)

  return newAnuncio
}

export async function updateAnuncio(id: string, updates: Partial<Anuncio>): Promise<Anuncio | null> {
  const db = readDB()
  const index = db.anuncios.findIndex(a => a.id === id)

  if (index === -1) return null

  db.anuncios[index] = { ...db.anuncios[index], ...updates }
  writeDB(db)

  return db.anuncios[index]
}

export async function deleteAnuncio(id: string): Promise<boolean> {
  const db = readDB()
  const index = db.anuncios.findIndex(a => a.id === id)

  if (index === -1) return false

  db.anuncios.splice(index, 1)
  writeDB(db)

  return true
}
