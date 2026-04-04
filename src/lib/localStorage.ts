import type { Anuncio } from '@/types/database'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data.json')

function readDataFile(): { anuncios: Anuncio[] } {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Erro ao ler data.json:', e)
  }
  return { anuncios: [] }
}

function writeDataFile(data: { anuncios: Anuncio[] }) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.error('Erro ao escrever data.json:', e)
  }
}

let anunciosCache: Anuncio[] = []

// Funções utilitárias para localStorage + arquivo
export function getAnuncios(): Anuncio[] {
  // No servidor, lê do arquivo
  if (typeof window === 'undefined') {
    const data = readDataFile()
    anunciosCache = data.anuncios
    return data.anuncios
  }
  
  // No browser, retorna do cache (sincronizado com servidor)
  try {
    const stored = localStorage.getItem('mostra_anuncios')
    const data = stored ? JSON.parse(stored) : []
    anunciosCache = data
    return data
  } catch (e) {
    return anunciosCache
  }
}

export function saveAnuncios(anuncios: Anuncio[]) {
  anunciosCache = anuncios
  
  // No servidor, salva no arquivo
  if (typeof window === 'undefined') {
    writeDataFile({ anuncios })
    return
  }
  
  // No browser, salva no localStorage
  localStorage.setItem('mostra_anuncios', JSON.stringify(anuncios))
}

export function addAnuncio(anuncio: Omit<Anuncio, 'id' | 'created_at'>): Anuncio {
  const anuncios = getAnuncios()
  const newAnuncio: Anuncio = {
    ...anuncio,
    id: Math.random().toString(36).substring(2) + Date.now().toString(36),
    created_at: new Date().toISOString(),
  }
  anuncios.push(newAnuncio)
  saveAnuncios(anuncios)
  return newAnuncio
}

export function updateAnuncio(id: string, updates: Partial<Anuncio>) {
  const anuncios = getAnuncios()
  const index = anuncios.findIndex(a => a.id === id)
  if (index !== -1) {
    anuncios[index] = { ...anuncios[index], ...updates }
    saveAnuncios(anuncios)
    return anuncios[index]
  }
  return null
}

export function deleteAnuncio(id: string) {
  const anuncios = getAnuncios()
  const filtered = anuncios.filter(a => a.id !== id)
  saveAnuncios(filtered)
}

export function getAnuncioById(id: string): Anuncio | null {
  const anuncios = getAnuncios()
  return anuncios.find(a => a.id === id) || null
}
