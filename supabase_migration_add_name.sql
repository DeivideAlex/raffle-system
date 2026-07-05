-- Migração: Adiciona coluna 'name' à tabela purchases
-- Execute este script no painel SQL do Supabase

ALTER TABLE purchases ADD COLUMN IF NOT EXISTS name TEXT DEFAULT '';
