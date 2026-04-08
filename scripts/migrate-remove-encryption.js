// migrate-remove-encryption.js
// Migração: remover criptografia do WhatsApp do Neon
//
// O que faz:
// 1. Descriptografa quaisquer WhatsApps ainda criptografados (usando safe_decrypt_whatsapp)
// 2. Remove as funções encrypt_whatsapp, decrypt_whatsapp, safe_decrypt_whatsapp
// 3. Remove a extensão pgcrypto (se não for usada por mais nada)
//
// Uso: node scripts/migrate-remove-encryption.js

require('dotenv').config({ path: '.env.local' })

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL não encontrada no .env.local')
    process.exit(1)
  }

  const postgres = require('postgres')
  const sql = postgres(DATABASE_URL, {
    ssl: { rejectUnauthorized: false },
    max: 1,
    prepare: false,
  })

  try {
    console.log('🔄 Iniciando migração: remover criptografia do WhatsApp...\n')

    // 1. Descriptografar dados existentes (se houver)
    // Usa safe_decrypt_whatsapp para lidar com dados já em texto puro
    const WHATSAPP_KEY = process.env.WHATSAPP_SECRET_KEY || 'mostra-secret-key-change-me'
    
    // Verificar quantos registros existem
    const countResult = await sql`SELECT COUNT(*) as total FROM anuncios`
    const total = parseInt(countResult[0].total)
    console.log(`📊 Total de anúncios no banco: ${total}`)

    if (total > 0) {
      // Descriptografar todos os WhatsApps usando safe_decrypt_whatsapp
      // (retorna o valor original se já estiver em texto puro)
      console.log('🔓 Descriptografando WhatsApps...')
      await sql.unsafe(
        `UPDATE anuncios SET vendedor_whatsapp = safe_decrypt_whatsapp(vendedor_whatsapp, $1)`,
        [WHATSAPP_KEY]
      )
      console.log(`✅ ${total} registro(s) atualizado(s)`)
    } else {
      console.log('ℹ️  Nenhum registro para descriptografar (tabela vazia)')
    }

    // 2. Remover funções de criptografia
    console.log('\n🗑️  Removendo funções de criptografia...')
    
    await sql`DROP FUNCTION IF EXISTS encrypt_whatsapp(TEXT, TEXT)`
    console.log('  ✅ encrypt_whatsapp removida')
    
    await sql`DROP FUNCTION IF EXISTS decrypt_whatsapp(TEXT, TEXT)`
    console.log('  ✅ decrypt_whatsapp removida')
    
    await sql`DROP FUNCTION IF EXISTS safe_decrypt_whatsapp(TEXT, TEXT)`
    console.log('  ✅ safe_decrypt_whatsapp removida')

    // 3. Remover extensão pgcrypto (opcional - pode ser usada por outras coisas)
    try {
      await sql`DROP EXTENSION IF EXISTS pgcrypto`
      console.log('  ✅ extensão pgcrypto removida')
    } catch (e) {
      console.log('  ⚠️  pgcrypto não removida (pode estar em uso por outros objetos)')
    }

    console.log('\n✅ Migração concluída com sucesso!')
    console.log('   - WhatsApps agora armazenados em texto puro')
    console.log('   - Funções de criptografia removidas do banco')
    console.log('\n💡 Lembre-se de remover WHATSAPP_SECRET_KEY das variáveis do Vercel também.')

  } catch (error) {
    console.error('❌ Erro na migração:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

main()
