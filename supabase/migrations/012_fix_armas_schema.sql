-- Corrigir schema da tabela armas
-- Remover coluna categoria (TEXT) se existir e garantir que categoria_id existe

-- Remover coluna categoria antiga se existir
ALTER TABLE armas DROP COLUMN IF EXISTS categoria;

-- Garantir que categoria_id existe e é FK para categorias
DO $$
BEGIN
  -- Verificar se a coluna categoria_id já existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'armas' AND column_name = 'categoria_id'
  ) THEN
    ALTER TABLE armas ADD COLUMN categoria_id INTEGER REFERENCES categorias(id);
  END IF;
END $$;

-- Garantir que calibres_id existe (padronizar nome da coluna)
DO $$
BEGIN
  -- Se calibre_id existe mas calibres_id não, renomear
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'armas' AND column_name = 'calibre_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'armas' AND column_name = 'calibres_id'
  ) THEN
    ALTER TABLE armas RENAME COLUMN calibre_id TO calibres_id;
  END IF;
END $$;








