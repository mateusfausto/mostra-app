# MOSTRA! — Configuração Dev/Prod

## 🚀 Ambiente de Desenvolvimento (Local)

### Setup Inicial

1. **Clone o repositório:**
   ```bash
   git clone <seu-repo>
   cd mostra-app
   ```

2. **Copie o arquivo de configuração:**
   ```bash
   cp .env.example .env.local
   ```

3. **Configure as variáveis:**
   - Abra `.env.local` e ajuste conforme necessário
   - `DB_TYPE=json` (padrão) usa banco de dados local na pasta `.db/`
   - Defina `NEXT_PUBLIC_MEU_WHATSAPP` com seu número
   - Defina `ADMIN_PASSWORD` com uma senha forte

4. **Instale dependências:**
   ```bash
   npm install
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

### Banco de Dados Local

- O banco de dados local é armazenado em `.db/anuncios.json`
- Não é versionado no Git (está em `.gitignore`)
- Perfeito para testes locais sem dependências externas

---

## 🔒 Ambiente de Produção (Neon)

### Setup no Neon

1. **Crie uma conta em:** https://console.neon.tech

2. **Crie um novo projeto** e copie a `DATABASE_URL`

3. **No seu servidor/plataforma de deploy** (Vercel, Railway, etc):
   - Defina a variável de ambiente `DB_TYPE=neon`
   - Defina a variável de ambiente `DATABASE_URL=postgresql://...`
   - Mantenha as outras variáveis (`ADMIN_PASSWORD`, etc)

4. **Teste a conexão:**
   ```bash
   # Localmente, você pode testar assim:
   DB_TYPE=neon DATABASE_URL="sua-url" npm run dev
   ```

### Implementar Funções PostgreSQL

O arquivo `src/lib/db.ts` tem placeholders para PostgreSQL. Quando estiver pronto:

1. Implemente as funções no `db.ts` para usar `pg` ou `postgres.js`
2. Atualize `db-schema.sql` com o schema completo
3. Execute o schema no console do Neon

Exemplo de conexão com `postgres.js`:
```typescript
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL)

export async function getAnuncios() {
  return await sql`SELECT * FROM anuncios ORDER BY created_at DESC`
}
```

---

## 📊 Estrutura do Banco de Dados

### Schema (Neon)

```sql
CREATE TABLE anuncios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  vendedor_whatsapp TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC(10, 2) NOT NULL,
  fotos TEXT[] NOT NULL DEFAULT '{}',
  categoria TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  data_expiracao TIMESTAMPTZ,
  tamanho TEXT[] NOT NULL DEFAULT '{}',
  regras_aceitas BOOLEAN NOT NULL DEFAULT false
);
```

Ver arquivo completo em `db-schema.sql`

---

## ⚙️ Variáveis de Ambiente

| Variável | Dev | Prod | Descrição |
|----------|-----|------|-----------|
| `DB_TYPE` | `json` | `neon` | Tipo de banco de dados |
| `DATABASE_URL` | _(vazio)_ | _(obrigatório)_ | URL de conexão PostgreSQL |
| `NEXT_PUBLIC_PIX_KEY` | ✅ | ✅ | Chave PIX |
| `NEXT_PUBLIC_MEU_WHATSAPP` | ✅ | ✅ | WhatsApp da moderadora |
| `ADMIN_PASSWORD` | ✅ | ✅ | Senha do painel admin |
| `NEXT_PUBLIC_ADMIN_EMAILS` | ✅ | ✅ | Emails dos administradores |

---

## 🔄 Fluxo de Deploy

```
Git Push (dev)
    ↓
GitHub (código limpo, sem .db, sem .env)
    ↓
Vercel/Railway (pull, instala deps)
    ↓
Define variáveis de ambiente (.env.production)
    ↓
npm run build
    ↓
Deploy com DB_TYPE=neon e DATABASE_URL
```

---

## 🛠️ Troubleshooting

### "Erro ao ler banco" em desenvolvimento
- Verifique se `DB_TYPE=json`
- A pasta `.db/` será criada automaticamente

### Erro de conexão com Neon
- Copie exatamente a `DATABASE_URL` do console Neon
- Verifique se as credenciais estão corretas

### Migrar dados do JSON para Neon
```typescript
// Script para rodar uma vez:
import { getAnuncios } from '@/lib/database'
import { sql } from 'postgres'

const anuncios = await getAnuncios()
for (const a of anuncios) {
  await sql`INSERT INTO anuncios (...) VALUES (...)`
}
```

---

**Documentação completa:** Ver `db-schema.sql` e `src/lib/db.ts`
