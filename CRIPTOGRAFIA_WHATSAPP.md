# 🔐 Criptografia de WhatsApp — Guia de Implementação

## Status Atual

O schema foi atualizado com **funções de criptografia AES-256** para o número de WhatsApp do vendedor.

## ⚙️ Como Funciona

### No Banco de Dados (Neon)

```sql
-- Criptografar ao inserir
INSERT INTO anuncios (vendedor_whatsapp, ...)
VALUES (encrypt_whatsapp('5511999999999'), ...);

-- Descriptografar ao ler
SELECT id, decrypt_whatsapp(vendedor_whatsapp) as whatsapp
FROM anuncios WHERE status = 'ativo';
```

### No Backend (Next.js)

**Opção 1: Criptografia no Banco (recomendado)**

```typescript
// src/app/api/anuncios/route.ts
import { sql } from 'postgres' // ou use a connection string

export async function POST(request: Request) {
  const { vendedor_whatsapp, ... } = await request.json()

  // O banco criptografa automaticamente
  const result = await sql`
    INSERT INTO anuncios (vendedor_whatsapp, ...)
    VALUES (encrypt_whatsapp($1), ...)
    RETURNING id
  `

  return NextResponse.json(result)
}

export async function GET() {
  // O banco descriptografa automaticamente
  const anuncios = await sql`
    SELECT id, decrypt_whatsapp(vendedor_whatsapp) as vendedor_whatsapp, ...
    FROM anuncios
    WHERE status = 'ativo'
  `

  return NextResponse.json(anuncios)
}
```

**Opção 2: Criptografia no Next.js (com crypto nativo)**

```typescript
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-prod'

export function encryptWhatsapp(phone: string): string {
  const cipher = crypto.createCipher('aes192', ENCRYPTION_KEY)
  let encrypted = cipher.update(phone, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

export function decryptWhatsapp(encrypted: string): string {
  const decipher = crypto.createDecipher('aes192', ENCRYPTION_KEY)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

// Usar:
const encrypted = encryptWhatsapp('5511999999999')
const decrypted = decryptWhatsapp(encrypted)
```

## 🔑 Configurar Chave de Criptografia em Produção

### No Neon

```bash
# 1. Gere uma chave segura (32 caracteres)
openssl rand -base64 32

# 2. No console do Neon:
SET app.encryption_key = 'sua-chave-gerada-acima';

# 3. Atualize as funções SQL para usar:
SET app.encryption_key = current_setting('app.encryption_key');
```

### No .env Produção

```bash
# .env.production
ENCRYPTION_KEY=sua-chave-segura-aqui
DATABASE_URL=postgresql://...
```

## 🛡️ Boas Práticas

✅ **Sempre use chave forte** - Pelo menos 32 caracteres aleatórios  
✅ **Não commit a chave** - Use variáveis de ambiente  
✅ **Rotacione chaves periodicamente** - A cada 90 dias em produção  
✅ **Use HTTPS/TLS** - Sempre em produção  
✅ **Logs nunca expõem dados** - Criptografe também em logs  

## 🔄 Migração de Dados Existentes

Se já tem dados no banco sem criptografia:

```sql
-- Criar backup
CREATE TABLE anuncios_backup AS SELECT * FROM anuncios;

-- Descriptografar dados antigos e re-criptografar
UPDATE anuncios 
SET vendedor_whatsapp = encrypt_whatsapp(vendedor_whatsapp)
WHERE STATUS = 'ativo';

-- Verificar
SELECT id, decrypt_whatsapp(vendedor_whatsapp) as whatsapp FROM anuncios LIMIT 1;
```

## 📊 Performance

- **Leitura**: Criptografia/descriptografia é rápida (< 1ms por registro)
- **Índices**: Não cria índices em campos criptografados (busca será lenta)
- **Alternativa**: Use hash + salt se precisar buscar por telefone

```sql
-- Se precisar buscar por telefone de forma segura:
SELECT * FROM anuncios 
WHERE pgp_sym_encrypt_bytea(vendedor_whatsapp) = pgp_sym_encrypt_bytea('5511999999999');
```

## ✅ Checklist

- [ ] Chave de criptografia gerada (32+ caracteres aleatórios)
- [ ] `.env` tem `ENCRYPTION_KEY`
- [ ] Schema SQL foi executado no Neon
- [ ] Testes de encrypt/decrypt funcionando
- [ ] Código backend atualizado para usar criptografia
- [ ] API testa POST (criptografa) e GET (descriptografa)
- [ ] Logs nunca expõem números de telefone

## 🚀 Deploy com Criptografia

```bash
# 1. Gere chave
openssl rand -base64 32

# 2. Configure em produção
ENCRYPTION_KEY=chave-gerada
DATABASE_URL=postgresql://...

# 3. Execute schema
psql $DATABASE_URL -f db-schema.sql

# 4. Deploy
npm run build
npm start
```

---

**Seus números de WhatsApp agora estão protegidos!** 🔒
