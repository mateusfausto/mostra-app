// db.ts - Abstração para banco de dados
// Suporta múltiplos backends: PostgreSQL (Neon), SQLite local, etc.

import fs from 'fs'
import path from 'path'
import type { Anuncio } from '@/types/database'

const DB_TYPE = process.env.DB_TYPE || 'json' // 'json', 'postgres', 'neon'
const DB_DIR = path.join(process.cwd(), '.db')
const DB_FILE = path.join(DB_DIR, 'anuncios.json')

// ==================== JSON Backend (Padrão) ====================

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

// ==================== Funções Principais ====================

export async function getAnuncios(): Promise<Anuncio[]> {
  if (DB_TYPE === 'json') {
    const db = readDB()
    return db.anuncios.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }
  // TODO: Implementar para Neon/PostgreSQL
  return []
}

export async function getAnuncioById(id: string): Promise<Anuncio | null> {
  if (DB_TYPE === 'json') {
    const db = readDB()
    return db.anuncios.find(a => a.id === id) || null
  }
  // TODO: Implementar para Neon/PostgreSQL
  return null
}

export async function addAnuncio(anuncio: Omit<Anuncio, 'id' | 'created_at'>): Promise<Anuncio> {
  if (DB_TYPE === 'json') {
    const db = readDB()
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36)
    const now = new Date().toISOString()

    const newAnuncio: Anuncio = {
      ...anuncio,
      id,
      created_at: now,
    }

    db.anuncios.push(newAnuncio)
    writeDB(db)
    return newAnuncio
  }
  // TODO: Implementar para Neon/PostgreSQL
  throw new Error('DB_TYPE not supported')
}

export async function updateAnuncio(id: string, updates: Partial<Omit<Anuncio, 'id' | 'created_at'>>): Promise<Anuncio | null> {
  if (DB_TYPE === 'json') {
    const db = readDB()
    const idx = db.anuncios.findIndex(a => a.id === id)
    if (idx === -1) return null

    db.anuncios[idx] = { ...db.anuncios[idx], ...updates }
    writeDB(db)
    return db.anuncios[idx]
  }
  // TODO: Implementar para Neon/PostgreSQL
  return null
}

export async function deleteAnuncio(id: string): Promise<boolean> {
  if (DB_TYPE === 'json') {
    const db = readDB()
    const idx = db.anuncios.findIndex(a => a.id === id)
    if (idx === -1) return false

    db.anuncios.splice(idx, 1)
    writeDB(db)
    return true
  }
  // TODO: Implementar para Neon/PostgreSQL
  return false
}

export async function getAnunciosByStatus(status: 'pendente' | 'ativo' | 'vendido'): Promise<Anuncio[]> {
  if (DB_TYPE === 'json') {
    const db = readDB()
    return db.anuncios
      .filter(a => a.status === status)
      .sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
  }
  // TODO: Implementar para Neon/PostgreSQL
  return []
}

export async function getMetricas(token?: string) {
  if (DB_TYPE === 'json') {
    const db = readDB()
    return {
      pendente: db.anuncios.filter(a => a.status === 'pendente').length,
      ativo: db.anuncios.filter(a => a.status === 'ativo').length,
      vendido: db.anuncios.filter(a => a.status === 'vendido').length,
      total: db.anuncios.length,
    }
  }
  // TODO: Implementar para Neon/PostgreSQL
  return { pendente: 0, ativo: 0, vendido: 0, total: 0 }
}
