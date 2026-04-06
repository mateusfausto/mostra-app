-- ============================================
-- Schema do banco de dados - Mostra App
-- PostgreSQL / Neon
-- ============================================
-- Execute este SQL no console do Neon para criar a tabela

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabela principal de anúncios
CREATE TABLE IF NOT EXISTS anuncios (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  vendedor_whatsapp TEXT NOT NULL,  -- armazenado criptografado via encrypt_whatsapp()
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
COMMENT ON COLUMN anuncios.vendedor_whatsapp IS 'Telefone criptografado com pgcrypto (AES). Use encrypt_whatsapp / decrypt_whatsapp.';
COMMENT ON COLUMN anuncios.estado IS 'UF com 2 letras maiúsculas: SP, RJ, MG, etc.';

-- ============================================
-- Funções de criptografia do WhatsApp
-- ============================================
-- ⚠️  Troque 'mostra-secret-key-change-me' por uma chave forte em produção!
--     Ideal: defina via variável de ambiente e use current_setting().

CREATE OR REPLACE FUNCTION encrypt_whatsapp(
  phone TEXT,
  key TEXT DEFAULT 'mostra-secret-key-change-me'
) RETURNS TEXT AS $$
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

CREATE OR REPLACE FUNCTION decrypt_whatsapp(
  encrypted TEXT,
  key TEXT DEFAULT 'mostra-secret-key-change-me'
) RETURNS TEXT AS $$
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

-- Versão segura: retorna valor bruto se decrypt falhar
-- (chave errada, dado em texto puro, etc.)
CREATE OR REPLACE FUNCTION safe_decrypt_whatsapp(
  encrypted TEXT,
  key TEXT DEFAULT 'mostra-secret-key-change-me'
) RETURNS TEXT AS $$
BEGIN
  RETURN convert_from(
    decrypt(
      decode(encrypted, 'base64'),
      convert_to(key, 'UTF8'),
      'aes'
    ),
    'UTF8'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN encrypted;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Exemplo de uso:
-- INSERT: encrypt_whatsapp('5521999999999')
-- SELECT: safe_decrypt_whatsapp(vendedor_whatsapp, 'sua-chave')

-- ============================================
-- MIGRAÇÃO: Adicionar colunas novas (rodar uma vez)
-- ============================================
-- Se sua tabela já existe e não tem essas colunas, execute:

ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS tamanho TEXT NOT NULL DEFAULT '';
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS regras_aceitas BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS cidade TEXT NOT NULL DEFAULT '';
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT '';
