# ✅ Checklist — Pronto para GitHub

## 📦 Antes de fazer Push

### Código Limpo
- [x] Sem referências a Supabase
- [x] Sem arquivos `.env` versionados
- [x] Sem banco de dados local (`.db/` no `.gitignore`)
- [x] Sem `package-lock.json` (será gerado por `npm install`)

### Configuração
- [x] `.env.example` documentado
- [x] `.env.local` para desenvolvimento local (não versionado)
- [x] `DB_TYPE=json` para desenvolvimento
- [x] Pronto para `DB_TYPE=neon` em produção

### Documentação
- [x] `README.md` atualizado
- [x] `SETUP_DEV_PROD.md` com instruções completas
- [x] `db-schema.sql` com schema para Neon
- [x] `src/lib/db.ts` com abstração preparada

### Git
- [x] `.gitignore` atualizado:
  - ✅ `.env` (sensível)
  - ✅ `.db/` (dados locais)
  - ✅ `node_modules/`
  - ✅ `/.next/`
  - ✅ `package-lock.json`

---

## 🚀 Comandos para Deploy

### Local
```bash
cp .env.example .env.local
npm install
npm run dev
```

### GitHub
```bash
git add .
git commit -m "Preparado para Neon em produção"
git push origin main
```

### Produção (Vercel/Railway/etc)
```bash
# Define variáveis de ambiente no painel da plataforma:
DB_TYPE=neon
DATABASE_URL=postgresql://...

# Deploy automático ao fazer push
npm run build
npm start
```

---

## 📋 Fluxo Recomendado

```
├── Desenvolvimento Local (DB_TYPE=json)
│   ├── .env.local (não versionado)
│   ├── .db/anuncios.json (não versionado)
│   └── npm run dev
│
├── GitHub (código limpo)
│   ├── .env.example (documentação)
│   ├── SETUP_DEV_PROD.md (instruções)
│   └── src/lib/db.ts (abstração)
│
└── Produção (DB_TYPE=neon)
    ├── DATABASE_URL (variável de ambiente secreta)
    ├── npm run build
    └── Conecta ao Neon automaticamente
```

---

## 🔒 Segurança

✅ `.env` não está versionado  
✅ `ADMIN_PASSWORD` em variável de ambiente  
✅ `DATABASE_URL` como variável secreta em produção  
✅ Banco local isolado em `.db/`

---

## ✨ Pronto para Clonar!

Qualquer pessoa pode agora:

1. Clonar o repo
2. Copiar `.env.example` para `.env.local`
3. Rodar `npm install` e `npm run dev`
4. Ter ambiente completo funcionando localmente
5. Deploy em produção com banco Neon é automático

---

**Última atualização:** 4 de abril de 2026
