# Supabase – migrações

## Como criar a tabela `armas` no banco

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard) e abra seu projeto.
2. No menu lateral, vá em **SQL Editor**.
3. Clique em **New query**.
4. Abra o arquivo `migrations/001_create_armas.sql` deste projeto, copie todo o conteúdo e cole no editor.
5. Clique em **Run** (ou Ctrl+Enter).

A tabela `armas` e as políticas de RLS serão criadas. Depois disso, a página de cadastro (`/cadastros`) passará a gravar os dados nessa tabela.
