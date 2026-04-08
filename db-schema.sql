-- ============================================
-- Schema do banco de dados - Mostra App
-- PostgreSQL / Neon
-- ============================================
-- Execute este SQL no console do Neon para criar a tabela

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela principal de anúncios
CREATE TABLE IF NOT EXISTS anuncios (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  vendedor_nome    TEXT NOT NULL DEFAULT '',
  vendedor_sobrenome TEXT NOT NULL DEFAULT '',
  vendedor_whatsapp TEXT NOT NULL,  -- armazenado em texto puro
  titulo          TEXT NOT NULL,
  descricao       TEXT,
  preco           NUMERIC(10,2) NOT NULL,
  fotos           TEXT[] NOT NULL DEFAULT '{}',
  categoria       TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pendente' 
                    CHECK (status IN ('pendente', 'ativo', 'vendido', 'removido')),
  data_expiracao  TIMESTAMPTZ,
  tamanho         TEXT NOT NULL DEFAULT '',
  regras_aceitas  BOOLEAN NOT NULL DEFAULT false,
  cidade          TEXT NOT NULL,
  estado          TEXT NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_anuncios_status ON anuncios(status);
CREATE INDEX IF NOT EXISTS idx_anuncios_categoria ON anuncios(categoria);
CREATE INDEX IF NOT EXISTS idx_anuncios_created_at ON anuncios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anuncios_cidade_estado ON anuncios(cidade, estado);

-- Comentários
COMMENT ON TABLE anuncios IS 'Anúncios de roupas do Mostra App';
COMMENT ON COLUMN anuncios.tamanho IS 'Tamanho único: PP, P, M, G, GG, XG, 36, 38, 40, 42, 44, 46';
COMMENT ON COLUMN anuncios.status IS 'pendente → ativo (aprovado) → vendido | removido';
COMMENT ON COLUMN anuncios.fotos IS 'Array de URLs (base64 data URIs ou URLs externas)';
COMMENT ON COLUMN anuncios.vendedor_whatsapp IS 'Telefone WhatsApp em texto puro.';
COMMENT ON COLUMN anuncios.estado IS 'UF com 2 letras maiúsculas: SP, RJ, MG, etc.';

-- ============================================
-- MIGRAÇÃO: Adicionar colunas novas (rodar uma vez)
-- ============================================
-- Se sua tabela já existe e não tem essas colunas, execute:

ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS tamanho TEXT NOT NULL DEFAULT '';
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS regras_aceitas BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS cidade TEXT NOT NULL DEFAULT '';
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT '';
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS vendedor_nome TEXT NOT NULL DEFAULT '';
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS vendedor_sobrenome TEXT NOT NULL DEFAULT '';
