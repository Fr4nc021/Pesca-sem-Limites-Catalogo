-- Tabela para armazenar múltiplas fotos por arma
CREATE TABLE IF NOT EXISTS fotos_armas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  arma_id UUID NOT NULL REFERENCES armas(id) ON DELETE CASCADE,
  foto_url TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_fotos_armas_arma_id ON fotos_armas(arma_id);

-- Row Level Security
ALTER TABLE fotos_armas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem inserir fotos"
  ON fotos_armas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem ler fotos"
  ON fotos_armas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar fotos"
  ON fotos_armas FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem atualizar fotos"
  ON fotos_armas FOR UPDATE
  TO authenticated
  USING (true);