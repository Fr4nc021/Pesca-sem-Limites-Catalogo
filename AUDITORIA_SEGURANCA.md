# 🔒 AUDITORIA COMPLETA DE SEGURANÇA

**Data:** 2025-01-27  
**Projeto:** Catálogo de Armas  
**Objetivo:** Garantir que nenhum usuário não autenticado consiga ler dados sensíveis ou modificar dados no Supabase

---

## ✅ PONTOS POSITIVOS

1. **Uso correto da ANON_KEY no frontend** - O projeto usa `NEXT_PUBLIC_SUPABASE_ANON_KEY`, que é apropriado para uso no cliente
2. **RLS habilitado** - Todas as tabelas principais têm Row Level Security habilitado
3. **Autenticação obrigatória** - O hook `useAuth` protege as rotas principais
4. **Sem SERVICE_ROLE_KEY exposta** - Não encontrei nenhuma referência à service role key no código
5. **Variáveis de ambiente protegidas** - `.env*` está no `.gitignore`

---

## 🚨 PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. ⚠️ **CRÍTICO: Tabela `categorias` sem política de INSERT/UPDATE/DELETE**

**Localização:** `supabase/migrations/009_add_rls_categorias.sql`

**Problema:**
- A tabela `categorias` tem RLS habilitado, mas **APENAS** tem política de SELECT
- Não há políticas para INSERT, UPDATE ou DELETE
- Isso significa que usuários autenticados **NÃO PODEM** modificar categorias, mas também não há proteção explícita contra isso

**Risco:**
- Se alguém tentar inserir/atualizar/deletar categorias via código, pode funcionar ou falhar dependendo do comportamento padrão do Supabase
- Inconsistência nas políticas de segurança

**Correção:**
```sql
-- Adicionar políticas completas para categorias
CREATE POLICY "Usuários autenticados podem inserir categorias"
  ON categorias FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar categorias"
  ON categorias FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar categorias"
  ON categorias FOR DELETE
  TO authenticated
  USING (true);
```

---

### 2. ⚠️ **CRÍTICO: Tabela `categorias` não existe nas migrations**

**Localização:** Nenhuma migration cria a tabela `categorias`

**Problema:**
- A migration `009_add_rls_categorias.sql` tenta habilitar RLS em uma tabela que não foi criada
- O código faz queries na tabela `categorias` em vários lugares:
  - `src/app/cadastros/page.tsx` (linha 130-133)
  - `src/app/categorias/page.tsx` (linha 45-48)
  - `src/app/produtos/[categoria]/page.tsx` (linha 129-133)

**Risco:**
- Se a tabela não existir, as queries falharão
- Se a tabela foi criada manualmente sem RLS, pode estar vulnerável

**Correção:**
Criar migration para criar a tabela:
```sql
-- Criar tabela categorias
CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

-- Políticas completas
CREATE POLICY "Usuários autenticados podem ler categorias"
  ON categorias FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir categorias"
  ON categorias FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar categorias"
  ON categorias FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar categorias"
  ON categorias FOR DELETE
  TO authenticated
  USING (true);
```

---

### 3. ⚠️ **CRÍTICO: Storage bucket `fotos-armas` sem política de INSERT**

**Localização:** `supabase/migrations/006_add_storage_delete_policy.sql`

**Problema:**
- O bucket `fotos-armas` tem políticas para DELETE e UPDATE
- **NÃO TEM política para INSERT/UPLOAD**
- O código faz upload de fotos em `src/app/cadastros/page.tsx` (linhas 421-426, 506-511)

**Risco:**
- Uploads podem falhar silenciosamente ou funcionar sem proteção adequada
- Usuários não autenticados podem conseguir fazer upload se não houver política restritiva

**Correção:**
```sql
-- Adicionar política de INSERT para storage
CREATE POLICY "Usuários autenticados podem fazer upload de fotos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'fotos-armas');

-- Adicionar política de SELECT (para visualizar)
CREATE POLICY "Usuários autenticados podem visualizar fotos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'fotos-armas');
```

---

### 4. ⚠️ **ALTO: Página `/produtos` usando Server Component incorretamente**

**Localização:** `src/app/produtos/page.tsx`

**Problema:**
- A página é um Server Component (sem `"use client"`)
- Tenta usar `supabase` diretamente, que é um cliente do browser
- Tenta acessar tabela `produtos` que não existe (deveria ser `armas`)

**Risco:**
- A página não funciona corretamente
- Pode causar erros em runtime
- Não há proteção de autenticação nesta página

**Correção:**
```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import Header from "../../components/Header";

export default function ProdutosPage() {
  const router = useRouter();
  const { authLoading } = useAuth();
  // ... resto da implementação com autenticação
}
```

---

### 5. ⚠️ **MÉDIO: Tabela `armas` com schema inconsistente**

**Localização:** `supabase/migrations/001_create_armas.sql`

**Problema:**
- A tabela `armas` tem coluna `categoria TEXT` na criação inicial
- Mas depois usa `categoria_id` (FK) em outras migrations
- Há inconsistência entre `calibre_id` e `calibres_id` no código

**Risco:**
- Pode causar confusão e bugs
- Não é uma vulnerabilidade direta, mas pode levar a erros

**Correção:**
Padronizar o schema da tabela `armas`:
```sql
-- Migration para corrigir schema
ALTER TABLE armas 
  DROP COLUMN IF EXISTS categoria,
  ADD COLUMN IF NOT EXISTS categoria_id INTEGER REFERENCES categorias(id);
```

---

### 6. ⚠️ **MÉDIO: Falta validação de autenticação em algumas queries**

**Localização:** Múltiplos arquivos

**Problema:**
- Embora o `useAuth` redirecione para `/login`, há um período entre o carregamento da página e a verificação
- Durante esse período, queries podem ser executadas antes da verificação de autenticação

**Risco:**
- Race condition onde queries podem ser executadas antes da verificação completa
- Se o RLS estiver mal configurado, pode permitir acesso não autorizado

**Correção:**
Garantir que todas as queries aguardem `authLoading`:
```typescript
useEffect(() => {
  if (authLoading) return; // SEMPRE verificar primeiro
  
  const fetchData = async () => {
    // queries aqui
  };
  
  fetchData();
}, [authLoading]);
```

**Status:** ✅ Já implementado corretamente na maioria dos arquivos, mas verificar todos.

---

### 7. ⚠️ **BAIXO: Exposição de informações em console.log**

**Localização:** 
- `src/app/cadastros/page.tsx` (linhas 437, 438, 465, 522, 523, 550)
- `src/app/categorias/page.tsx` (linha 51)

**Problema:**
- Vários `console.log` expõem dados sensíveis no console do browser
- URLs de fotos, IDs de armas, etc.

**Risco:**
- Informações podem ser vistas por qualquer pessoa com acesso ao console
- Não é crítico, mas não é uma boa prática

**Correção:**
Remover ou substituir por logs condicionais apenas em desenvolvimento:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

---

### 8. ⚠️ **BAIXO: Falta proteção CSRF**

**Problema:**
- Não há proteção explícita contra CSRF (Cross-Site Request Forgery)
- O Supabase gerencia tokens automaticamente, mas é bom ter camadas extras

**Risco:**
- Baixo, pois o Supabase gerencia tokens de sessão
- Mas é uma boa prática adicionar proteção adicional

**Correção:**
O Supabase já gerencia isso automaticamente através de tokens de sessão. Não é crítico.

---

## 📋 CHECKLIST DE VERIFICAÇÃO

### Variáveis de Ambiente
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Correto (pode ser público)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Correto (pode ser público)
- ✅ `.env*` no `.gitignore` - Protegido
- ✅ Sem SERVICE_ROLE_KEY exposta - Seguro

### Configuração do Supabase Client
- ✅ Usa apenas ANON_KEY - Correto
- ✅ Cliente criado uma vez e reutilizado - Eficiente
- ⚠️ Não há cliente server-side separado - Pode ser melhorado para Server Components

### Row Level Security (RLS)
- ✅ `armas` - RLS habilitado com políticas completas
- ✅ `marcas` - RLS habilitado com políticas completas
- ✅ `calibres` - RLS habilitado com políticas completas
- ✅ `funcionamento` - RLS habilitado com políticas completas
- ✅ `fotos_armas` - RLS habilitado com políticas completas
- ⚠️ `categorias` - RLS habilitado mas políticas incompletas
- ⚠️ Storage `fotos-armas` - Falta política de INSERT

### Autenticação
- ✅ Login com email/password - Implementado
- ✅ Hook `useAuth` protege rotas - Implementado
- ✅ Redirecionamento para `/login` quando não autenticado - Funcional
- ⚠️ Race condition possível em algumas páginas - Verificar

### Queries ao Banco
- ✅ Todas as queries usam o cliente Supabase com RLS
- ✅ Queries aguardam autenticação na maioria dos casos
- ⚠️ Página `/produtos` tem problemas

### APIs e Server Functions
- ✅ Não há APIs públicas expostas - Seguro
- ✅ Não há server actions sem proteção - Seguro
- ✅ Tudo depende do RLS - Correto

---

## 🔧 CORREÇÕES RECOMENDADAS (PRIORIDADE)

### Prioridade CRÍTICA (Fazer imediatamente):

1. **Criar migration para tabela `categorias`** com RLS completo
2. **Adicionar política de INSERT no storage** `fotos-armas`
3. **Corrigir página `/produtos`** para usar Client Component com autenticação

### Prioridade ALTA (Fazer em breve):

4. **Padronizar schema da tabela `armas`** (remover `categoria` TEXT, usar apenas `categoria_id`)
5. **Adicionar políticas UPDATE/DELETE para `categorias`**

### Prioridade MÉDIA (Melhorias):

6. **Remover console.logs** de produção
7. **Adicionar validação adicional** de autenticação antes de queries críticas

---

## ✅ CONCLUSÃO

O projeto tem uma **base de segurança sólida** com:
- RLS habilitado em todas as tabelas principais
- Autenticação obrigatória nas rotas protegidas
- Uso correto da ANON_KEY no frontend
- Sem SERVICE_ROLE_KEY exposta

**Principais vulnerabilidades encontradas:**
1. Tabela `categorias` sem criação adequada e políticas incompletas
2. Storage sem política de INSERT
3. Página `/produtos` com problemas de implementação

**Recomendação:** Corrigir os problemas críticos antes de colocar em produção.

---

## 📝 NOTAS ADICIONAIS

- O projeto não tem APIs ou server actions, então toda a segurança depende do RLS
- Isso é uma arquitetura válida, mas requer que o RLS esteja 100% correto
- Todas as queries são feitas no cliente, então qualquer falha no RLS seria crítica
- A autenticação por email do Supabase é segura e não pode ser burlada facilmente, desde que:
  - As senhas sejam fortes
  - O email de confirmação esteja habilitado no Supabase
  - Rate limiting esteja configurado no Supabase Dashboard

