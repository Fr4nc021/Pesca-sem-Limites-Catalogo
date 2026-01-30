-- Migration: 016_fix_all_insert_update_delete_policies.sql
-- Corrige todas as políticas de INSERT, UPDATE e DELETE que exigem is_admin()
-- mas a tabela user_roles não existe, bloqueando todas as operações
-- Permite que usuários autenticados possam fazer essas operações

-- ===== TABELA: armas =====
-- Remover todas as políticas antigas possíveis
DROP POLICY IF EXISTS "armas_insert_admin_only" ON armas;
DROP POLICY IF EXISTS "armas_update_admin_only" ON armas;
DROP POLICY IF EXISTS "armas_delete_admin_only" ON armas;
DROP POLICY IF EXISTS "Apenas admins podem inserir armas" ON armas;
DROP POLICY IF EXISTS "Apenas admins podem atualizar armas" ON armas;
DROP POLICY IF EXISTS "Apenas admins podem deletar armas" ON armas;

DROP POLICY IF EXISTS "armas_insert_authenticated" ON armas;
CREATE POLICY "armas_insert_authenticated"
  ON armas FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "armas_update_authenticated" ON armas;
CREATE POLICY "armas_update_authenticated"
  ON armas FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "armas_delete_authenticated" ON armas;
CREATE POLICY "armas_delete_authenticated"
  ON armas FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');

-- ===== TABELA: fotos_armas =====
-- Remover todas as políticas antigas possíveis
DROP POLICY IF EXISTS "fotos_armas_insert_admin_only" ON fotos_armas;
DROP POLICY IF EXISTS "fotos_armas_update_admin_only" ON fotos_armas;
DROP POLICY IF EXISTS "fotos_armas_delete_admin_only" ON fotos_armas;
DROP POLICY IF EXISTS "Apenas admins podem inserir fotos" ON fotos_armas;
DROP POLICY IF EXISTS "Apenas admins podem atualizar fotos" ON fotos_armas;
DROP POLICY IF EXISTS "Apenas admins podem deletar fotos" ON fotos_armas;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir fotos" ON fotos_armas;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar fotos" ON fotos_armas;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar fotos" ON fotos_armas;

DROP POLICY IF EXISTS "fotos_armas_insert_authenticated" ON fotos_armas;
CREATE POLICY "fotos_armas_insert_authenticated"
  ON fotos_armas FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "fotos_armas_update_authenticated" ON fotos_armas;
CREATE POLICY "fotos_armas_update_authenticated"
  ON fotos_armas FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "fotos_armas_delete_authenticated" ON fotos_armas;
CREATE POLICY "fotos_armas_delete_authenticated"
  ON fotos_armas FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');

-- ===== TABELA: marcas =====
-- Remover todas as políticas antigas possíveis
DROP POLICY IF EXISTS "marcas_insert_admin_only" ON marcas;
DROP POLICY IF EXISTS "marcas_update_admin_only" ON marcas;
DROP POLICY IF EXISTS "marcas_delete_admin_only" ON marcas;
DROP POLICY IF EXISTS "Apenas admins podem inserir marcas" ON marcas;
DROP POLICY IF EXISTS "Apenas admins podem atualizar marcas" ON marcas;
DROP POLICY IF EXISTS "Apenas admins podem deletar marcas" ON marcas;

DROP POLICY IF EXISTS "marcas_insert_authenticated" ON marcas;
CREATE POLICY "marcas_insert_authenticated"
  ON marcas FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "marcas_update_authenticated" ON marcas;
CREATE POLICY "marcas_update_authenticated"
  ON marcas FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "marcas_delete_authenticated" ON marcas;
CREATE POLICY "marcas_delete_authenticated"
  ON marcas FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');

-- ===== TABELA: categorias =====
-- Remover todas as políticas antigas possíveis
DROP POLICY IF EXISTS "categorias_insert_admin_only" ON categorias;
DROP POLICY IF EXISTS "categorias_update_admin_only" ON categorias;
DROP POLICY IF EXISTS "categorias_delete_admin_only" ON categorias;
DROP POLICY IF EXISTS "Apenas admins podem inserir categorias" ON categorias;
DROP POLICY IF EXISTS "Apenas admins podem atualizar categorias" ON categorias;
DROP POLICY IF EXISTS "Apenas admins podem deletar categorias" ON categorias;

DROP POLICY IF EXISTS "categorias_insert_authenticated" ON categorias;
CREATE POLICY "categorias_insert_authenticated"
  ON categorias FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "categorias_update_authenticated" ON categorias;
CREATE POLICY "categorias_update_authenticated"
  ON categorias FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "categorias_delete_authenticated" ON categorias;
CREATE POLICY "categorias_delete_authenticated"
  ON categorias FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');

-- ===== TABELA: calibres =====
-- Remover todas as políticas antigas possíveis
DROP POLICY IF EXISTS "calibres_insert_admin_only" ON calibres;
DROP POLICY IF EXISTS "calibres_update_admin_only" ON calibres;
DROP POLICY IF EXISTS "calibres_delete_admin_only" ON calibres;
DROP POLICY IF EXISTS "Apenas admins podem inserir calibres" ON calibres;
DROP POLICY IF EXISTS "Apenas admins podem atualizar calibres" ON calibres;
DROP POLICY IF EXISTS "Apenas admins podem deletar calibres" ON calibres;

DROP POLICY IF EXISTS "calibres_insert_authenticated" ON calibres;
CREATE POLICY "calibres_insert_authenticated"
  ON calibres FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "calibres_update_authenticated" ON calibres;
CREATE POLICY "calibres_update_authenticated"
  ON calibres FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "calibres_delete_authenticated" ON calibres;
CREATE POLICY "calibres_delete_authenticated"
  ON calibres FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');

-- ===== TABELA: funcionamento =====
-- Remover todas as políticas antigas possíveis
DROP POLICY IF EXISTS "funcionamento_insert_admin_only" ON funcionamento;
DROP POLICY IF EXISTS "funcionamento_update_admin_only" ON funcionamento;
DROP POLICY IF EXISTS "funcionamento_delete_admin_only" ON funcionamento;
DROP POLICY IF EXISTS "Apenas admins podem inserir funcionamento" ON funcionamento;
DROP POLICY IF EXISTS "Apenas admins podem atualizar funcionamento" ON funcionamento;
DROP POLICY IF EXISTS "Apenas admins podem deletar funcionamento" ON funcionamento;

DROP POLICY IF EXISTS "funcionamento_insert_authenticated" ON funcionamento;
CREATE POLICY "funcionamento_insert_authenticated"
  ON funcionamento FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "funcionamento_update_authenticated" ON funcionamento;
CREATE POLICY "funcionamento_update_authenticated"
  ON funcionamento FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "funcionamento_delete_authenticated" ON funcionamento;
CREATE POLICY "funcionamento_delete_authenticated"
  ON funcionamento FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');

