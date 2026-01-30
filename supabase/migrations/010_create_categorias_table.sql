-- Criar tabela categorias se não existir
CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para buscas por nome
CREATE INDEX IF NOT EXISTS idx_categorias_nome ON categorias (nome);

-- Habilitar Row Level Security
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem (da migration 009)
DROP POLICY IF EXISTS "Usuários autenticados podem ler categorias" ON categorias;

-- Política para SELECT: usuários autenticados podem ler categorias
CREATE POLICY "Usuários autenticados podem ler categorias"
  ON categorias FOR SELECT
  TO authenticated
  USING (true);

-- Política para INSERT: usuários autenticados podem inserir categorias
CREATE POLICY "Usuários autenticados podem inserir categorias"
  ON categorias FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para UPDATE: usuários autenticados podem atualizar categorias
CREATE POLICY "Usuários autenticados podem atualizar categorias"
  ON categorias FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para DELETE: usuários autenticados podem deletar categorias
CREATE POLICY "Usuários autenticados podem deletar categorias"
  ON categorias FOR DELETE
  TO authenticated
  USING (true);

-- Inserir categorias padrão se não existirem
INSERT INTO categorias (nome) VALUES
  ('Pistolas'),
  ('Revólveres'),
  ('Espingarda_Semi'),
  ('Espingarda_Rep'),
  ('Carabinas'),
  ('Fuzil')
ON CONFLICT (nome) DO NOTHING;

