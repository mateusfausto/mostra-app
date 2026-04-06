#!/usr/bin/env node
// ============================================
// Script de migração: Criptografar números de WhatsApp existentes
// Roda uma vez só para converter dados em texto puro → criptografado
// ============================================
// Uso: node scripts/migrate-encrypt-whatsapp.js

const fs = require('fs')
const path = require('path')

// Carregar .env.local manualmente (sem depender de dotenv)
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim()
        const value = trimmed.slice(eqIdx + 1).trim()
        if (!process.env[key]) process.env[key] = value
      }
    }
  })
}

const DATABASE_URL = process.env.DATABASE_URL
const WHATSAPP_KEY = process.env.WHATSAPP_SECRET_KEY || 'mostra-secret-key-change-me'

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada em .env.local')
  process.exit(1)
}

async function migrate() {
  const postgres = require('postgres')
  const sql = postgres(DATABASE_URL, {
    ssl: { rejectUnauthorized: false },
    max: 1,
    prepare: false,
  })

  try {
    console.log('🔍 Buscando anúncios com WhatsApp em texto puro...')

    // Buscar todos os anúncios
    const anuncios = await sql`SELECT id, vendedor_whatsapp FROM anuncios`

    if (anuncios.length === 0) {
      console.log('ℹ️  Nenhum anúncio encontrado.')
      await sql.end()
      return
    }

    console.log(`📦 ${anuncios.length} anúncio(s) encontrado(s).\n`)

    let migrated = 0
    let skipped = 0

    for (const a of anuncios) {
      const phone = a.vendedor_whatsapp

      // Heurística: Se já está criptografado (base64), pular
      // Números de telefone têm só dígitos; base64 tem letras/=
      const isPlainPhone = /^\d+$/.test(phone)

      if (!isPlainPhone) {
        console.log(`  ⏩ ${a.id} — já parece criptografado, pulando`)
        skipped++
        continue
      }

      // Criptografar usando a função SQL
      await sql`
        UPDATE anuncios 
        SET vendedor_whatsapp = encrypt_whatsapp(${phone}, ${WHATSAPP_KEY})
        WHERE id = ${a.id}
      `

      console.log(`  ✅ ${a.id} — ${phone.slice(0, 4)}***${phone.slice(-2)} → criptografado`)
      migrated++
    }

    console.log(`\n📊 Resultado:`)
    console.log(`   Migrados:  ${migrated}`)
    console.log(`   Ignorados: ${skipped}`)
    console.log(`   Total:     ${anuncios.length}`)
    console.log('\n✅ Migração concluída!')

    // Verificação: tentar descriptografar o primeiro registro
    if (migrated > 0) {
      const check = await sql`
        SELECT decrypt_whatsapp(vendedor_whatsapp, ${WHATSAPP_KEY}) AS phone 
        FROM anuncios LIMIT 1
      `
      console.log(`\n🔓 Verificação: decrypt do primeiro registro = ${check[0].phone}`)
    }

    await sql.end()
  } catch (error) {
    console.error('❌ Erro na migração:', error)
    await sql.end()
    process.exit(1)
  }
}

migrate()
