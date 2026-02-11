-- Exemplo: supabase/migrations/020_add_acabamento_variacoes_armas.sql
ALTER TABLE variacoes_armas
  ADD COLUMN IF NOT EXISTS caracteristica_acabamento TEXT;