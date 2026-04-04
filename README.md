# 🎨 Mostra! — Plataforma de Désapego VIP

Plataforma para publicação e gerenciamento de peças de vestuário de alta qualidade.

## 🚀 Quick Start

### Desenvolvimento Local

```bash
# 1. Clone e entre na pasta
git clone <seu-repo>
cd mostra-app

# 2. Copie o arquivo de configuração
cp .env.example .env.local

# 3. Instale dependências
npm install

# 4. Inicie o servidor
npm run dev
```

Acesse: http://localhost:3000

**Banco de dados local:** `.db/anuncios.json` (automático, não é versionado)

---

## 📋 Painel Administrativo

### Acesso

- **URL:** http://localhost:3000/admin
- **Senha:** Configurada em `ADMIN_PASSWORD` no `.env.local`

### Funções

- ✅ Aprovar/Rejeitar anúncios
- ✅ Acompanhar métricas
- ✅ Gerenciar status de anúncios
- ✅ Ver contato dos anunciantes

---

## 🔧 Configuração

### Variáveis Principais

- `DB_TYPE`: `json` (desenvolvimento) ou `neon` (produção)
- `NEXT_PUBLIC_MEU_WHATSAPP`: WhatsApp da moderadora
- `ADMIN_PASSWORD`: Senha do painel admin
- `NEXT_PUBLIC_TAXA_ANUNCIO`: Taxa de anúncio em %

Ver `.env.example` para todas as opções.

---

## 🌐 Deploy em Produção

### Com Neon (PostgreSQL)

1. **Crie uma conta:** https://console.neon.tech
2. **Configure variáveis no seu host (Vercel, Railway, etc):**
   ```
   DB_TYPE=neon
   DATABASE_URL=postgresql://...
   ```
3. **Execute o schema:** Veja `db-schema.sql`

### Com Vercel

```bash
npm run build
vercel deploy
```

---

## 📚 Documentação

- **Setup Dev/Prod:** `SETUP_DEV_PROD.md`
- **Schema do Banco:** `db-schema.sql`
- **API Routes:** `src/app/api/`
- **Tipos:** `src/types/database.ts`

---

## 🛠️ Stack

- **Frontend:** React 18 + Next.js 13
- **Styling:** Tailwind CSS
- **Fonts:** Cormorant Garamond + DM Sans
- **Database:** JSON (dev) | PostgreSQL/Neon (prod)
- **Deployment:** Vercel

---

## 📱 Funcionalidades

✅ Publicação de anúncios  
✅ Galeria de fotos  
✅ Busca e filtros  
✅ Favoritos  
✅ WhatsApp integrado  
✅ Painel administrativo  
✅ Métricas em tempo real  

---

**Feito com ❤️ para a comunidade de moda sustentável**
