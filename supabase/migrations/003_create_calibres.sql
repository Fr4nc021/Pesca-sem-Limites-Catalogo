-- Tabela calibres: cadastro de calibres para uso no cadastro de armas
CREATE TABLE IF NOT EXISTS calibres (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  nome TEXT NOT NULL UNIQUE
);

-- Índice para buscas por nome
CREATE INDEX IF NOT EXISTS idx_calibres_nome ON calibres (nome);

-- RLS
ALTER TABLE calibres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem inserir em calibres"
  ON calibres FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem ler calibres"
  ON calibres FOR SELECT
  TO authenticated
  USING (true);

  INSERT INTO calibres (nome) VALUES
  ('9MM'),
  ('10 MM'),
  ('12 GA'),
  ('20 GA'),
  ('22 LR'),
  ('22 WMR'),
  ('380 ACP'),
  ('38 TPC'),
  ('38 SPL'),
  ('357 MAG'),
  ('308 WIN'),
  ('45 ACP'),
  ('454 CASULL'),
  ('36 GA')

ON CONFLICT DO NOTHING;  -- só funciona se nome for UNIQUE