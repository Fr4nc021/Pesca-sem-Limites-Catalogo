-- ============================================
-- Script de Adição de Índices para Performance
-- ============================================

-- Índices para tabela armas
CREATE INDEX IF NOT EXISTS idx_armas_em_destaque ON armas(em_destaque) WHERE em_destaque = true;
CREATE INDEX IF NOT EXISTS idx_armas_categoria_id ON armas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_armas_marca_id ON armas(marca_id);
-- Nota: A coluna na tabela armas é calibres_id (não calibre_id)
CREATE INDEX IF NOT EXISTS idx_armas_calibres_id ON armas(calibres_id);
CREATE INDEX IF NOT EXISTS idx_armas_funcionamento_id ON armas(funcionamento_id);

-- Índices para tabela fotos_armas
CREATE INDEX IF NOT EXISTS idx_fotos_armas_arma_id ON fotos_armas(arma_id);
CREATE INDEX IF NOT EXISTS idx_fotos_armas_arma_id_ordem ON fotos_armas(arma_id, ordem);
CREATE INDEX IF NOT EXISTS idx_fotos_armas_variacao_id ON fotos_armas(variacao_id);

-- Índices para tabela variacoes_armas
CREATE INDEX IF NOT EXISTS idx_variacoes_armas_arma_id ON variacoes_armas(arma_id);
CREATE INDEX IF NOT EXISTS idx_variacoes_armas_calibre_id ON variacoes_armas(calibre_id);

-- Índices para tabela profiles
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role) WHERE role = 'admin';

-- Índices para tabela user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON user_roles(user_id, role) WHERE role = 'admin';

