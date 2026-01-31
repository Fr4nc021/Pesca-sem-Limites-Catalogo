-- Tabela de variações: calibre + tamanho de cano + preço por combinação
CREATE TABLE IF NOT EXISTS variacoes_armas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  arma_id UUID NOT NULL REFERENCES armas(id) ON DELETE CASCADE,
  calibre_id UUID REFERENCES calibres(id),
  comprimento_cano TEXT NOT NULL,
  preco DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_variacoes_armas_arma_id ON variacoes_armas(arma_id);

ALTER TABLE variacoes_armas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "variacoes_armas_insert_authenticated"
  ON variacoes_armas FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "variacoes_armas_select_authenticated"
  ON variacoes_armas FOR SELECT TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "variacoes_armas_update_authenticated"
  ON variacoes_armas FOR UPDATE TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "variacoes_armas_delete_authenticated"
  ON variacoes_armas FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

  -- Fotos passam a pertencer a uma variação (tamanho de cano)
ALTER TABLE fotos_armas
  ADD COLUMN IF NOT EXISTS variacao_id UUID REFERENCES variacoes_armas(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_fotos_armas_variacao_id ON fotos_armas(variacao_id);