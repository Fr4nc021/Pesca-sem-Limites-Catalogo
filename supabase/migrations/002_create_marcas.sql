-- Tabela marcas: cadastro de marcas para uso no cadastro de armas
CREATE TABLE IF NOT EXISTS marcas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  nome TEXT NOT NULL UNIQUE
);

-- Índice para buscas por nome
CREATE INDEX IF NOT EXISTS idx_marcas_nome ON marcas (nome);

-- RLS
ALTER TABLE marcas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem inserir em marcas"
  ON marcas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem ler marcas"
  ON marcas FOR SELECT
  TO authenticated
  USING (true);

-- Adiciona FK em armas (opcional: permite null para armas sem marca)
ALTER TABLE armas
  ADD COLUMN IF NOT EXISTS marca_id UUID REFERENCES marcas (id);

  INSERT INTO marcas (nome) VALUES
  ('Taurus S.A'),
  ('CBC - Companhia Brasileira de Cartuchos'),
  ('Glock'),
  ('Smith & Wesson'),
  ('Beretta')   
ON CONFLICT DO NOTHING;  -- só funciona se nome for UNIQUE