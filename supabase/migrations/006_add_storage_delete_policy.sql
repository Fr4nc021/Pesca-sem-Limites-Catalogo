-- Criar o bucket se não existir (caso ainda não tenha sido criado)
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos-armas', 'fotos-armas', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir DELETE de arquivos no bucket fotos-armas para usuários autenticados
CREATE POLICY "Usuários autenticados podem deletar fotos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'fotos-armas');

-- Política para permitir UPDATE de arquivos no bucket fotos-armas (caso precise atualizar)
CREATE POLICY "Usuários autenticados podem atualizar fotos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'fotos-armas')
WITH CHECK (bucket_id = 'fotos-armas');