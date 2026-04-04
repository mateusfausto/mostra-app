-- =====================================================
-- Mostra! — Schema do Banco de Dados (Supabase)
-- Execute no SQL Editor do Supabase Dashboard
-- =====================================================

-- 1. Criar tabela de anúncios
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
  regras_aceitas      BOOLEAN NOT NULL DEFAULT false,
  medida_busto        NUMERIC(5, 1),
  medida_cintura      NUMERIC(5, 1),
  medida_quadril      NUMERIC(5, 1),
  medida_comprimento  NUMERIC(5, 1)
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_anuncios_status ON public.anuncios (status);
CREATE INDEX IF NOT EXISTS idx_anuncios_categoria ON public.anuncios (categoria);
CREATE INDEX IF NOT EXISTS idx_anuncios_expiracao ON public.anuncios (data_expiracao);
CREATE INDEX IF NOT EXISTS idx_anuncios_created ON public.anuncios (created_at DESC);

-- 3. Row Level Security (RLS)
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

-- 4. Storage bucket para fotos
-- Execute manualmente no Supabase Dashboard > Storage > New Bucket
-- Nome: fotos
-- Opção: Public bucket ✓

-- Política de storage (execute após criar o bucket)
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos', 'fotos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Upload público de fotos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'fotos');

CREATE POLICY "Leitura pública de fotos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'fotos');

-- 5. (Opcional) Função para expirar anúncios automaticamente via pg_cron
-- Requer extensão pg_cron habilitada no Supabase
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('expirar-anuncios', '0 0 * * *',
--   $$UPDATE public.anuncios SET status = 'removido'
--     WHERE status = 'ativo' AND data_expiracao < now()$$);
