-- Adicionar políticas completas para o bucket fotos-armas

-- Política para INSERT: usuários autenticados podem fazer upload de fotos
CREATE POLICY IF NOT EXISTS "Usuários autenticados podem fazer upload de fotos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'fotos-armas');

-- Política para SELECT: usuários autenticados podem visualizar fotos
CREATE POLICY IF NOT EXISTS "Usuários autenticados podem visualizar fotos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'fotos-armas');

-- As políticas de UPDATE e DELETE já existem na migration 006
-- Verificar se estão corretas e não duplicar

