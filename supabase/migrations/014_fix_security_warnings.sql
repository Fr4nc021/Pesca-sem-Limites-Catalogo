-- Migration: 014_fix_security_warnings.sql
-- Corrige todos os avisos de segurança do Supabase Security Advisor

-- ============================================
-- 1. CORRIGIR: Function Search Path Mutable
-- ============================================

-- Recriar função is_admin com search_path fixo
DROP FUNCTION IF EXISTS is_admin() CASCADE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Recriar função is_authenticated com search_path fixo
DROP FUNCTION IF EXISTS is_authenticated() CASCADE;

CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$;

-- ============================================
-- 2. CORRIGIR: RLS Policy Always True
-- ============================================

-- Remover políticas antigas que usam true diretamente
-- e recriar usando auth.role() que é mais seguro

-- ===== TABELA: armas =====
DROP POLICY IF EXISTS "Usuários autenticados podem ler armas" ON armas;
DROP POLICY IF EXISTS "Apenas admins podem inserir armas" ON armas;
DROP POLICY IF EXISTS "Apenas admins podem atualizar armas" ON armas;
DROP POLICY IF EXISTS "Apenas admins podem deletar armas" ON armas;

-- SELECT: Todos autenticados podem ler
CREATE POLICY "armas_select_authenticated"
  ON armas FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

-- INSERT/UPDATE/DELETE: Apenas admins
CREATE POLICY "armas_insert_admin_only"
  ON armas FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "armas_update_admin_only"
  ON armas FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "armas_delete_admin_only"
  ON armas FOR DELETE
  TO authenticated
  USING (is_admin());

-- ===== TABELA: marcas =====
DROP POLICY IF EXISTS "Usuários autenticados podem ler marcas" ON marcas;
DROP POLICY IF EXISTS "Apenas admins podem inserir marcas" ON marcas;
DROP POLICY IF EXISTS "Apenas admins podem atualizar marcas" ON marcas;
DROP POLICY IF EXISTS "Apenas admins podem deletar marcas" ON marcas;

CREATE POLICY "marcas_select_authenticated"
  ON marcas FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

CREATE POLICY "marcas_insert_admin_only"
  ON marcas FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "marcas_update_admin_only"
  ON marcas FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "marcas_delete_admin_only"
  ON marcas FOR DELETE
  TO authenticated
  USING (is_admin());

-- ===== TABELA: categorias =====
DROP POLICY IF EXISTS "Usuários autenticados podem ler categorias" ON categorias;
DROP POLICY IF EXISTS "Apenas admins podem inserir categorias" ON categorias;
DROP POLICY IF EXISTS "Apenas admins podem atualizar categorias" ON categorias;
DROP POLICY IF EXISTS "Apenas admins podem deletar categorias" ON categorias;

CREATE POLICY "categorias_select_authenticated"
  ON categorias FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

CREATE POLICY "categorias_insert_admin_only"
  ON categorias FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "categorias_update_admin_only"
  ON categorias FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "categorias_delete_admin_only"
  ON categorias FOR DELETE
  TO authenticated
  USING (is_admin());

-- ===== TABELA: fotos_armas =====
DROP POLICY IF EXISTS "Usuários autenticados podem ler fotos" ON fotos_armas;
DROP POLICY IF EXISTS "Apenas admins podem inserir fotos" ON fotos_armas;
DROP POLICY IF EXISTS "Apenas admins podem atualizar fotos" ON fotos_armas;
DROP POLICY IF EXISTS "Apenas admins podem deletar fotos" ON fotos_armas;

CREATE POLICY "fotos_armas_select_authenticated"
  ON fotos_armas FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

CREATE POLICY "fotos_armas_insert_admin_only"
  ON fotos_armas FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "fotos_armas_update_admin_only"
  ON fotos_armas FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "fotos_armas_delete_admin_only"
  ON fotos_armas FOR DELETE
  TO authenticated
  USING (is_admin());

-- ===== TABELA: calibres =====
DROP POLICY IF EXISTS "Usuários autenticados podem ler calibres" ON calibres;
DROP POLICY IF EXISTS "Apenas admins podem inserir calibres" ON calibres;
DROP POLICY IF EXISTS "Apenas admins podem atualizar calibres" ON calibres;
DROP POLICY IF EXISTS "Apenas admins podem deletar calibres" ON calibres;

CREATE POLICY "calibres_select_authenticated"
  ON calibres FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

CREATE POLICY "calibres_insert_admin_only"
  ON calibres FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "calibres_update_admin_only"
  ON calibres FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "calibres_delete_admin_only"
  ON calibres FOR DELETE
  TO authenticated
  USING (is_admin());

-- ===== TABELA: funcionamento =====
DROP POLICY IF EXISTS "Usuários autenticados podem ler funcionamento" ON funcionamento;
DROP POLICY IF EXISTS "Apenas admins podem inserir funcionamento" ON funcionamento;
DROP POLICY IF EXISTS "Apenas admins podem atualizar funcionamento" ON funcionamento;
DROP POLICY IF EXISTS "Apenas admins podem deletar funcionamento" ON funcionamento;

CREATE POLICY "funcionamento_select_authenticated"
  ON funcionamento FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

CREATE POLICY "funcionamento_insert_admin_only"
  ON funcionamento FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "funcionamento_update_admin_only"
  ON funcionamento FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "funcionamento_delete_admin_only"
  ON funcionamento FOR DELETE
  TO authenticated
  USING (is_admin());