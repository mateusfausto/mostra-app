// db.ts - Abstração para banco de dados
// Suporta múltiplos backends: JSON (dev local) e PostgreSQL/Neon (produção)

import fs from 'fs'
import path from 'path'
import type { Anuncio } from '@/types/database'

const DB_TYPE = process.env.DB_TYPE || 'json'

// ==================== JSON Backend (Desenvolvimento) ====================

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
    console.error('Erro ao ler banco local:', e)
    return { anuncios: [] }
  }
}

function writeDB(data: { anuncios: Anuncio[] }) {
  try {
    ensureDbFile()
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.error('Erro ao escrever banco local:', e)
  }
}

// ==================== PostgreSQL/Neon Backend (Produção) ====================

let sql: any = null

async function initPostgres() {
  if (sql) return sql
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurada! Configure em .env ou variáveis de ambiente.')
  }

  try {
    // Import condicional apenas para servidor
    if (typeof window === 'undefined') {
      const postgres = require('postgres')
      sql = postgres(process.env.DATABASE_URL, {
        ssl: { rejectUnauthorized: false },
        max: 1,
        prepare: false,
      })
      console.log('✅ Conectado ao Neon')
    }
    return sql
  } catch (error) {
    console.error('❌ Erro ao conectar ao Neon:', error)
    throw error
  }
}

// ==================== Funções Públicas ====================

export async function getAnuncios(): Promise<Anuncio[]> {
  if (DB_TYPE === 'json') {
    const db = readDB()
    return db.anuncios.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }
  
  // PostgreSQL/Neon
  const dbConn = await initPostgres()
  try {
    const anuncios = await dbConn`
      SELECT 
        id, created_at, vendedor_nome, vendedor_sobrenome, vendedor_whatsapp,
        titulo, descricao, preco, fotos, categoria, status,
        data_expiracao, tamanho, regras_aceitas, cidade, estado
      FROM anuncios 
      ORDER BY created_at DESC
    `
    return anuncios
  } catch (e) {
    console.error('Erro ao buscar anúncios:', e)
    return []
  }
}

export async function getAnuncioById(id: string): Promise<Anuncio | null> {
  if (DB_TYPE === 'json') {
    const db = readDB()
    return db.anuncios.find(a => a.id === id) || null
  }
  
  // PostgreSQL/Neon
  const dbConn = await initPostgres()
  try {
    const result = await dbConn`
      SELECT 
        id, created_at, vendedor_nome, vendedor_sobrenome, vendedor_whatsapp,
        titulo, descricao, preco, fotos, categoria, status,
        data_expiracao, tamanho, regras_aceitas, cidade, estado
      FROM anuncios WHERE id = ${id}
    `
    return result[0] || null
  } catch (e) {
    console.error('Erro ao buscar anúncio:', e)
    return null
  }
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
  
  // PostgreSQL/Neon
  const dbConn = await initPostgres()
  try {
    const result = await dbConn`
      INSERT INTO anuncios (
        vendedor_nome, vendedor_sobrenome, vendedor_whatsapp,
        titulo, descricao, preco, fotos,
        categoria, status, data_expiracao, tamanho, regras_aceitas,
        cidade, estado
      ) VALUES (
        ${anuncio.vendedor_nome}, ${anuncio.vendedor_sobrenome},
        ${anuncio.vendedor_whatsapp}, ${anuncio.titulo}, 
        ${anuncio.descricao}, ${anuncio.preco}, 
        ${anuncio.fotos}, ${anuncio.categoria}, 
        ${anuncio.status}, ${anuncio.data_expiracao}, 
        ${anuncio.tamanho}, ${anuncio.regras_aceitas},
        ${anuncio.cidade}, ${anuncio.estado}
      )
      RETURNING 
        id, created_at, vendedor_nome, vendedor_sobrenome, vendedor_whatsapp,
        titulo, descricao, preco, fotos, categoria, status,
        data_expiracao, tamanho, regras_aceitas, cidade, estado
    `
    
    return result[0]
  } catch (e) {
    console.error('Erro ao adicionar anúncio:', e)
    throw e
  }
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
  
  // PostgreSQL/Neon
  const dbConn = await initPostgres()
  try {
    // Build dynamic update query
    const setClauses = []
    const values: any[] = []
    
    if (updates.status !== undefined) {
      setClauses.push('status')
      values.push(updates.status)
    }
    if (updates.titulo !== undefined) {
      setClauses.push('titulo')
      values.push(updates.titulo)
    }
    if (updates.descricao !== undefined) {
      setClauses.push('descricao')
      values.push(updates.descricao)
    }
    if (updates.preco !== undefined) {
      setClauses.push('preco')
      values.push(updates.preco)
    }
    if (updates.data_expiracao !== undefined) {
      setClauses.push('data_expiracao')
      values.push(updates.data_expiracao)
    }

    if (setClauses.length === 0) return null

    // Build the query using postgres.js template
    let query = `UPDATE anuncios SET `
    query += setClauses.map((col, i) => `${col} = $${i + 1}`).join(', ')
    query += ` WHERE id = $${setClauses.length + 1}`
    query += ` RETURNING id, created_at, vendedor_nome, vendedor_sobrenome, vendedor_whatsapp,`
    query += ` titulo, descricao, preco, fotos, categoria, status, data_expiracao, tamanho, regras_aceitas, cidade, estado`

    const result = await dbConn.unsafe(query, [...values, id])
    return result[0] || null
  } catch (e) {
    console.error('Erro ao atualizar anúncio:', e)
    return null
  }
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
  
  // PostgreSQL/Neon
  const dbConn = await initPostgres()
  try {
    await dbConn`
      DELETE FROM anuncios WHERE id = ${id}
    `
    return true
  } catch (e) {
    console.error('Erro ao deletar anúncio:', e)
    return false
  }
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
  
  // PostgreSQL/Neon
  const dbConn = await initPostgres()
  try {
    const anuncios = await dbConn`
      SELECT 
        id, created_at, vendedor_nome, vendedor_sobrenome, vendedor_whatsapp,
        titulo, descricao, preco, fotos, categoria, status,
        data_expiracao, tamanho, regras_aceitas, cidade, estado
      FROM anuncios 
      WHERE status = ${status}
      ORDER BY created_at DESC
    `
    return anuncios
  } catch (e) {
    console.error('Erro ao buscar anúncios por status:', e)
    return []
  }
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
  
  // PostgreSQL/Neon
  const dbConn = await initPostgres()
  try {
    const result = await dbConn`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pendente') as pendente,
        COUNT(*) FILTER (WHERE status = 'ativo') as ativo,
        COUNT(*) FILTER (WHERE status = 'vendido') as vendido,
        COUNT(*) as total
      FROM anuncios
    `
    return result[0]
  } catch (e) {
    console.error('Erro ao buscar métricas:', e)
    return { pendente: 0, ativo: 0, vendido: 0, total: 0 }
  }
}
