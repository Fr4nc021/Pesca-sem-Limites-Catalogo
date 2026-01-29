-- Adicionar políticas RLS para UPDATE e DELETE na tabela armas
-- Remove políticas existentes se houver e recria para garantir que estão corretas

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar armas" ON armas;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar armas" ON armas;

-- Política para UPDATE: usuários autenticados podem atualizar armas
CREATE POLICY "Usuários autenticados podem atualizar armas"
  ON armas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para DELETE: usuários autenticados podem deletar armas
CREATE POLICY "Usuários autenticados podem deletar armas"
  ON armas FOR DELETE
  TO authenticated
  USING (true);