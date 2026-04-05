// database.ts - REDIRECIONAMENTO para db.ts
// DESCONTINUADO: Use src/lib/db.ts em vez disso
// Este arquivo apenas re-exporta tudo de db.ts para compatibilidade

export {
  getAnuncios,
  getAnuncioById,
  addAnuncio,
  updateAnuncio,
  deleteAnuncio,
} from './db'
