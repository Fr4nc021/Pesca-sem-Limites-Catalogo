-- ============================================
-- Script de Otimização de RLS Policies
-- Resolve alertas específicos do Database Linter
-- ============================================

-- ============================================
-- 1. CRIAR/ATUALIZAR FUNÇÃO HELPER is_admin() OTIMIZADA
-- ============================================

DROP FUNCTION IF EXISTS is_admin() CASCADE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
  );
END;
$$;

-- ============================================
-- 2. CORRIGIR TABELA: armas
-- ============================================

-- Remover todas as policies duplicadas
DROP POLICY IF EXISTS "Usuários autenticados podem inserir em armas" ON armas;
DROP POLICY IF EXISTS "Usuários autenticados podem ler armas" ON armas;
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar armas" ON armas;
DROP POLICY IF EXISTS "armas_select" ON armas;
DROP POLICY IF EXISTS "armas_insert" ON armas;
DROP POLICY IF EXISTS "armas_update" ON armas;
DROP POLICY IF EXISTS "armas_delete" ON armas;
DROP POLICY IF EXISTS "armas_select_authenticated" ON armas;
DROP POLICY IF EXISTS "armas_insert_authenticated" ON armas;
DROP POLICY IF EXISTS "armas_update_authenticated" ON armas;
DROP POLICY IF EXISTS "armas_delete_authenticated" ON armas;
DROP POLICY IF EXISTS "armas_insert_admin_only" ON armas;
DROP POLICY IF EXISTS "armas_update_admin_only" ON armas;
DROP POLICY IF EXISTS "armas_delete_admin_only" ON armas;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar armas" ON armas;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar armas" ON armas;
DROP POLICY IF EXISTS "Apenas admins podem inserir armas" ON armas;
DROP POLICY IF EXISTS "Apenas admins podem atualizar armas" ON armas;
DROP POLICY IF EXISTS "Apenas admins podem deletar armas" ON armas;

-- Remover novas policies caso já existam de execução anterior
DROP POLICY IF EXISTS "armas_select" ON armas;
DROP POLICY IF EXISTS "armas_insert" ON armas;
DROP POLICY IF EXISTS "armas_update" ON armas;
DROP POLICY IF EXISTS "armas_delete" ON armas;

-- Criar uma única policy otimizada por ação
CREATE POLICY "armas_select"
  ON armas FOR SELECT
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "armas_insert"
  ON armas FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "armas_update"
  ON armas FOR UPDATE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "armas_delete"
  ON armas FOR DELETE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

-- ============================================
-- 3. CORRIGIR TABELA: variacoes_armas
-- ============================================

DROP POLICY IF EXISTS "variacoes_armas_insert_authenticated" ON variacoes_armas;
DROP POLICY IF EXISTS "variacoes_armas_select_authenticated" ON variacoes_armas;
DROP POLICY IF EXISTS "variacoes_armas_update_authenticated" ON variacoes_armas;
DROP POLICY IF EXISTS "variacoes_armas_delete_authenticated" ON variacoes_armas;
-- Remover novas policies caso já existam de execução anterior
DROP POLICY IF EXISTS "variacoes_armas_select" ON variacoes_armas;
DROP POLICY IF EXISTS "variacoes_armas_insert" ON variacoes_armas;
DROP POLICY IF EXISTS "variacoes_armas_update" ON variacoes_armas;
DROP POLICY IF EXISTS "variacoes_armas_delete" ON variacoes_armas;

CREATE POLICY "variacoes_armas_select"
  ON variacoes_armas FOR SELECT
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "variacoes_armas_insert"
  ON variacoes_armas FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "variacoes_armas_update"
  ON variacoes_armas FOR UPDATE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "variacoes_armas_delete"
  ON variacoes_armas FOR DELETE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

-- ============================================
-- 4. CORRIGIR TABELA: fotos_armas
-- ============================================

DROP POLICY IF EXISTS "Usuários autenticados podem inserir fotos" ON fotos_armas;
DROP POLICY IF EXISTS "Usuários autenticados podem ler fotos" ON fotos_armas;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar fotos" ON fotos_armas;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar fotos" ON fotos_armas;
DROP POLICY IF EXISTS "fotos_armas_select_authenticated" ON fotos_armas;
DROP POLICY IF EXISTS "fotos_armas_insert_admin_only" ON fotos_armas;
DROP POLICY IF EXISTS "fotos_armas_update_admin_only" ON fotos_armas;
DROP POLICY IF EXISTS "fotos_armas_delete_admin_only" ON fotos_armas;
DROP POLICY IF EXISTS "fotos_armas_insert_authenticated" ON fotos_armas;
DROP POLICY IF EXISTS "fotos_armas_update_authenticated" ON fotos_armas;
DROP POLICY IF EXISTS "fotos_armas_delete_authenticated" ON fotos_armas;
DROP POLICY IF EXISTS "Apenas admins podem inserir fotos" ON fotos_armas;
DROP POLICY IF EXISTS "Apenas admins podem atualizar fotos" ON fotos_armas;
DROP POLICY IF EXISTS "Apenas admins podem deletar fotos" ON fotos_armas;
-- Remover novas policies caso já existam de execução anterior
DROP POLICY IF EXISTS "fotos_armas_select" ON fotos_armas;
DROP POLICY IF EXISTS "fotos_armas_insert" ON fotos_armas;
DROP POLICY IF EXISTS "fotos_armas_update" ON fotos_armas;
DROP POLICY IF EXISTS "fotos_armas_delete" ON fotos_armas;

CREATE POLICY "fotos_armas_select"
  ON fotos_armas FOR SELECT
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "fotos_armas_insert"
  ON fotos_armas FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "fotos_armas_update"
  ON fotos_armas FOR UPDATE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "fotos_armas_delete"
  ON fotos_armas FOR DELETE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

-- ============================================
-- 5. CORRIGIR TABELA: categorias
-- ============================================

DROP POLICY IF EXISTS "Usuários autenticados podem ler categorias" ON categorias;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir categorias" ON categorias;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar categorias" ON categorias;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar categorias" ON categorias;
DROP POLICY IF EXISTS "categorias_select_authenticated" ON categorias;
DROP POLICY IF EXISTS "categorias_insert_admin_only" ON categorias;
DROP POLICY IF EXISTS "categorias_update_admin_only" ON categorias;
DROP POLICY IF EXISTS "categorias_delete_admin_only" ON categorias;
DROP POLICY IF EXISTS "categorias_insert_authenticated" ON categorias;
DROP POLICY IF EXISTS "categorias_update_authenticated" ON categorias;
DROP POLICY IF EXISTS "categorias_delete_authenticated" ON categorias;
DROP POLICY IF EXISTS "Apenas admins podem inserir categorias" ON categorias;
DROP POLICY IF EXISTS "Apenas admins podem atualizar categorias" ON categorias;
DROP POLICY IF EXISTS "Apenas admins podem deletar categorias" ON categorias;
-- Remover novas policies caso já existam de execução anterior
DROP POLICY IF EXISTS "categorias_select" ON categorias;
DROP POLICY IF EXISTS "categorias_insert" ON categorias;
DROP POLICY IF EXISTS "categorias_update" ON categorias;
DROP POLICY IF EXISTS "categorias_delete" ON categorias;

CREATE POLICY "categorias_select"
  ON categorias FOR SELECT
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "categorias_insert"
  ON categorias FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "categorias_update"
  ON categorias FOR UPDATE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "categorias_delete"
  ON categorias FOR DELETE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

-- ============================================
-- 6. CORRIGIR TABELA: calibres
-- ============================================

DROP POLICY IF EXISTS "Usuários autenticados podem inserir em calibres" ON calibres;
DROP POLICY IF EXISTS "Usuários autenticados podem ler calibres" ON calibres;
DROP POLICY IF EXISTS "Enable read access for all users" ON calibres;
DROP POLICY IF EXISTS "calibres_select" ON calibres;
DROP POLICY IF EXISTS "calibres_insert" ON calibres;
DROP POLICY IF EXISTS "calibres_update" ON calibres;
DROP POLICY IF EXISTS "calibres_delete" ON calibres;
DROP POLICY IF EXISTS "calibres_insert_authenticated" ON calibres;
DROP POLICY IF EXISTS "calibres_update_authenticated" ON calibres;
DROP POLICY IF EXISTS "calibres_delete_authenticated" ON calibres;
DROP POLICY IF EXISTS "calibres_insert_admin_only" ON calibres;
DROP POLICY IF EXISTS "calibres_update_admin_only" ON calibres;
DROP POLICY IF EXISTS "calibres_delete_admin_only" ON calibres;
DROP POLICY IF EXISTS "Apenas admins podem inserir calibres" ON calibres;
DROP POLICY IF EXISTS "Apenas admins podem atualizar calibres" ON calibres;
DROP POLICY IF EXISTS "Apenas admins podem deletar calibres" ON calibres;

CREATE POLICY "calibres_select"
  ON calibres FOR SELECT
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "calibres_insert"
  ON calibres FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "calibres_update"
  ON calibres FOR UPDATE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "calibres_delete"
  ON calibres FOR DELETE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

-- ============================================
-- 7. CORRIGIR TABELA: marcas
-- ============================================

DROP POLICY IF EXISTS "Usuários autenticados podem inserir em calibres" ON marcas;
DROP POLICY IF EXISTS "Usuários autenticados podem ler calibres" ON marcas;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir em marcas" ON marcas;
DROP POLICY IF EXISTS "Usuários autenticados podem ler marcas" ON marcas;
DROP POLICY IF EXISTS "marcas_select" ON marcas;
DROP POLICY IF EXISTS "marcas_insert" ON marcas;
DROP POLICY IF EXISTS "marcas_update" ON marcas;
DROP POLICY IF EXISTS "marcas_delete" ON marcas;
DROP POLICY IF EXISTS "marcas_select_authenticated" ON marcas;
DROP POLICY IF EXISTS "marcas_insert_authenticated" ON marcas;
DROP POLICY IF EXISTS "marcas_update_authenticated" ON marcas;
DROP POLICY IF EXISTS "marcas_delete_authenticated" ON marcas;
DROP POLICY IF EXISTS "marcas_insert_admin_only" ON marcas;
DROP POLICY IF EXISTS "marcas_update_admin_only" ON marcas;
DROP POLICY IF EXISTS "marcas_delete_admin_only" ON marcas;
DROP POLICY IF EXISTS "Apenas admins podem inserir marcas" ON marcas;
DROP POLICY IF EXISTS "Apenas admins podem atualizar marcas" ON marcas;
DROP POLICY IF EXISTS "Apenas admins podem deletar marcas" ON marcas;

CREATE POLICY "marcas_select"
  ON marcas FOR SELECT
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "marcas_insert"
  ON marcas FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "marcas_update"
  ON marcas FOR UPDATE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "marcas_delete"
  ON marcas FOR DELETE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

-- ============================================
-- 8. CORRIGIR TABELA: funcionamento
-- ============================================

DROP POLICY IF EXISTS "Usuários autenticados podem inserir em funcionamento" ON funcionamento;
DROP POLICY IF EXISTS "Usuários autenticados podem ler funcionamento" ON funcionamento;
DROP POLICY IF EXISTS "funcionamento_select_authenticated" ON funcionamento;
DROP POLICY IF EXISTS "funcionamento_insert_admin_only" ON funcionamento;
DROP POLICY IF EXISTS "funcionamento_update_admin_only" ON funcionamento;
DROP POLICY IF EXISTS "funcionamento_delete_admin_only" ON funcionamento;
DROP POLICY IF EXISTS "funcionamento_insert_authenticated" ON funcionamento;
DROP POLICY IF EXISTS "funcionamento_update_authenticated" ON funcionamento;
DROP POLICY IF EXISTS "funcionamento_delete_authenticated" ON funcionamento;
DROP POLICY IF EXISTS "Apenas admins podem inserir funcionamento" ON funcionamento;
DROP POLICY IF EXISTS "Apenas admins podem atualizar funcionamento" ON funcionamento;
DROP POLICY IF EXISTS "Apenas admins podem deletar funcionamento" ON funcionamento;
-- Remover novas policies caso já existam de execução anterior
DROP POLICY IF EXISTS "funcionamento_select" ON funcionamento;
DROP POLICY IF EXISTS "funcionamento_insert" ON funcionamento;
DROP POLICY IF EXISTS "funcionamento_update" ON funcionamento;
DROP POLICY IF EXISTS "funcionamento_delete" ON funcionamento;

CREATE POLICY "funcionamento_select"
  ON funcionamento FOR SELECT
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "funcionamento_insert"
  ON funcionamento FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "funcionamento_update"
  ON funcionamento FOR UPDATE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "funcionamento_delete"
  ON funcionamento FOR DELETE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

-- ============================================
-- 9. CORRIGIR TABELA: user_roles
-- ============================================

DROP POLICY IF EXISTS "Usuários podem ver seu próprio role" ON user_roles;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar roles" ON user_roles;
DROP POLICY IF EXISTS "user_roles_select" ON user_roles;
DROP POLICY IF EXISTS "user_roles_insert" ON user_roles;
DROP POLICY IF EXISTS "user_roles_update" ON user_roles;
DROP POLICY IF EXISTS "user_roles_delete" ON user_roles;

-- Criar uma única policy otimizada por ação
-- SELECT: usuários podem ver seu próprio role OU admins podem ver todos
CREATE POLICY "user_roles_select"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id 
    OR is_admin()
  );

-- INSERT/UPDATE/DELETE: apenas admins
CREATE POLICY "user_roles_insert"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "user_roles_update"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "user_roles_delete"
  ON user_roles FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- 10. CORRIGIR TABELA: profiles
-- ============================================

DROP POLICY IF EXISTS "Usuários autenticados podem ver perfis" ON profiles;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_delete" ON profiles;

-- Criar uma única policy otimizada por ação
-- SELECT: usuários podem ver seu próprio perfil OU admins podem ver todos
CREATE POLICY "profiles_select"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = id 
    OR is_admin()
  );

-- INSERT: usuários podem criar seu próprio perfil
CREATE POLICY "profiles_insert"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

-- UPDATE: usuários podem atualizar seu próprio perfil OU admins podem atualizar todos
CREATE POLICY "profiles_update"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id OR is_admin())
  WITH CHECK ((SELECT auth.uid()) = id OR is_admin());

-- DELETE: usuários podem deletar seu próprio perfil OU admins podem deletar todos
CREATE POLICY "profiles_delete"
  ON profiles FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = id OR is_admin());

-- ============================================
-- 11. POLICIES DE STORAGE (se necessário)
-- ============================================

-- Remover policies antigas de storage
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar fotos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar fotos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar fotos" ON storage.objects;
-- Remover novas policies caso já existam de execução anterior
DROP POLICY IF EXISTS "storage_fotos_armas_select" ON storage.objects;
DROP POLICY IF EXISTS "storage_fotos_armas_insert" ON storage.objects;
DROP POLICY IF EXISTS "storage_fotos_armas_update" ON storage.objects;
DROP POLICY IF EXISTS "storage_fotos_armas_delete" ON storage.objects;

-- Criar policies otimizadas de storage
CREATE POLICY "storage_fotos_armas_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'fotos-armas' AND (SELECT auth.role()) = 'authenticated');

CREATE POLICY "storage_fotos_armas_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'fotos-armas' AND (SELECT auth.role()) = 'authenticated');

CREATE POLICY "storage_fotos_armas_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'fotos-armas' AND (SELECT auth.role()) = 'authenticated')
  WITH CHECK (bucket_id = 'fotos-armas' AND (SELECT auth.role()) = 'authenticated');

CREATE POLICY "storage_fotos_armas_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'fotos-armas' AND (SELECT auth.role()) = 'authenticated');

