-- =====================================================
-- Mostra! — Schema do Banco de Dados (Neon/PostgreSQL)
-- Execute no console do Neon: https://console.neon.tech
-- =====================================================

-- 1. Habilitar extensão pgcrypto para criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Criar tabela de anúncios
CREATE TABLE IF NOT EXISTS public.anuncios (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  vendedor_whatsapp   TEXT NOT NULL,
  titulo              TEXT NOT NULL,
  descricao           TEXT,
  preco               NUMERIC(10, 2) NOT NULL,
  fotos               TEXT[] NOT NULL DEFAULT '{}',
  categoria           TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pendente'
                      CHECK (status IN ('pendente', 'ativo', 'vendido', 'removido')),
  data_expiracao      TIMESTAMPTZ,
  tamanho             TEXT[] NOT NULL DEFAULT '{}',
  regras_aceitas      BOOLEAN NOT NULL DEFAULT false
);

-- 2. Funções de Criptografia do WhatsApp
-- Chave de criptografia: altere para uma chave segura em produção
CREATE OR REPLACE FUNCTION encrypt_whatsapp(phone TEXT, key TEXT DEFAULT 'default-key-change-in-prod')
RETURNS TEXT AS $$
BEGIN
  RETURN encode(
    encrypt(
      convert_to(phone, 'UTF8'),
      convert_to(key, 'UTF8'),
      'aes'
    ),
    'base64'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION decrypt_whatsapp(encrypted TEXT, key TEXT DEFAULT 'default-key-change-in-prod')
RETURNS TEXT AS $$
BEGIN
  RETURN convert_from(
    decrypt(
      decode(encrypted, 'base64'),
      convert_to(key, 'UTF8'),
      'aes'
    ),
    'UTF8'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_anuncios_status ON public.anuncios (status);
CREATE INDEX IF NOT EXISTS idx_anuncios_categoria ON public.anuncios (categoria);
CREATE INDEX IF NOT EXISTS idx_anuncios_expiracao ON public.anuncios (data_expiracao);
CREATE INDEX IF NOT EXISTS idx_anuncios_created ON public.anuncios (created_at DESC);

-- 4. Row Level Security (RLS)
ALTER TABLE public.anuncios ENABLE ROW LEVEL SECURITY;

-- Política: qualquer pessoa pode ler anúncios ativos não expirados
CREATE POLICY "Vitrine pública — leitura de anúncios ativos"
  ON public.anuncios
  FOR SELECT
  USING (
    status = 'ativo'
    AND (data_expiracao IS NULL OR data_expiracao > now())
  );

-- Política: qualquer pessoa pode criar anúncios (pendente)
CREATE POLICY "Qualquer um pode criar anúncios"
  ON public.anuncios
  FOR INSERT
  WITH CHECK (status = 'pendente');

-- Política: service_role (backend) tem acesso total
-- (as API Routes do Next.js usam a service_role key via ADMIN_PASSWORD)

-- 5. Storage bucket para fotos (Neon não tem storage, use S3/Cloudinary)
-- Para fotos, recomenda-se usar: Cloudinary, AWS S3, Vercel Blob, etc

-- 6. (Opcional) Função para expirar anúncios automaticamente via pg_cron
-- Requer extensão pg_cron habilitada no Neon
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('expirar-anuncios', '0 0 * * *',
--   $$UPDATE public.anuncios SET status = 'removido'
--     WHERE status = 'ativo' AND data_expiracao < now()$$);

-- =====================================================
-- EXEMPLOS DE USO (no backend/Next.js)
-- =====================================================

-- Criptografar ao inserir:
-- INSERT INTO anuncios (vendedor_whatsapp, ...)
-- VALUES (encrypt_whatsapp('5511999999999'), ...);

-- Descriptografar ao ler:
-- SELECT id, decrypt_whatsapp(vendedor_whatsapp) as whatsapp, ... 
-- FROM anuncios WHERE status = 'ativo';

-- =====================================================
-- IMPORTANTE: ALTERAR CHAVE DE CRIPTOGRAFIA EM PRODUÇÃO
-- =====================================================
-- Em produção, use uma variável de ambiente segura:
-- SET app.encryption_key = 'sua-chave-segura-aqui';
-- Depois atualize as funções para usar current_setting('app.encryption_key');
