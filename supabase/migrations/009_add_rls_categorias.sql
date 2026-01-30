-- Habilitar Row Level Security na tabela categorias
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura (SELECT) apenas para usuários autenticados
CREATE POLICY "Usuários autenticados podem ler categorias"
  ON categorias FOR SELECT
  TO authenticated
  USING (true);