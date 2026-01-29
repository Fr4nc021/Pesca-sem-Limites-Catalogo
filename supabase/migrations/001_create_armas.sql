-- Tabela armas: cadastro de armas com categoria, preço, características e especificações
CREATE TABLE IF NOT EXISTS armas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Dados gerais
  categoria TEXT NOT NULL,
  nome TEXT NOT NULL,
  preco DECIMAL(12, 2),

  -- Especificações
  calibre_id null,
  funcionamento_id null,
  espec_capacidade_tiros TEXT,
  espec_carregadores TEXT,
  marca_id null,
  espec_comprimento_cano TEXT,
  caracteristica_acabamento TEXT
);

-- Row Level Security (opcional): só usuários autenticados podem inserir/ler
ALTER TABLE armas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem inserir em armas"
  ON armas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem ler armas"
  ON armas FOR SELECT
  TO authenticated
  USING (true);
