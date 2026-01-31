-- Adicionar coluna em_destaque na tabela armas
ALTER TABLE armas 
ADD COLUMN IF NOT EXISTS em_destaque BOOLEAN DEFAULT FALSE;

-- Criar índice para melhorar performance nas consultas de destaques
CREATE INDEX IF NOT EXISTS idx_armas_em_destaque ON armas(em_destaque) WHERE em_destaque = TRUE;


