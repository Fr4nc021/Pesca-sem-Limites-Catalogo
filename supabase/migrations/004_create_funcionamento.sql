-- Tabela marcas: cadastro de marcas para uso no cadastro de armas
CREATE TABLE IF NOT EXISTS funcionamento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  nome TEXT NOT NULL UNIQUE
);

-- Índice para buscas por nome
CREATE INDEX IF NOT EXISTS idx_marcas_nome ON funcionamento (nome);

-- RLS
ALTER TABLE funcionamento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem inserir em funcionamento"
  ON funcionamento FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem ler funcionamento"
  ON funcionamento FOR SELECT
  TO authenticated
  USING (true);

-- Adiciona FK em armas (opcional: permite null para armas sem marca)
ALTER TABLE funcionamento
  ADD COLUMN IF NOT EXISTS funcionamento_id UUID REFERENCES armas (id);

  INSERT INTO funcionamento (nome) VALUES
  ('Semi-Automático'),
  ('Repetição')

ON CONFLICT DO NOTHING;  -- só funciona se nome for UNIQUE