# Catálogo de Armas - Sistema de Apresentação

## 📋 Sobre o Sistema

Este é um sistema de catálogo digital desenvolvido para apresentar armas de forma prática e visual aos clientes. Como a loja trabalha **sem armas à pronta entrega**, o objetivo principal do catálogo é permitir que os clientes visualizem os produtos disponíveis com fotos, especificações técnicas e valores, facilitando a escolha e o processo de venda.

## 🎯 Objetivo

O sistema foi desenvolvido para resolver a necessidade de apresentar produtos que não estão fisicamente disponíveis na loja. Através do catálogo digital, os clientes podem:

- **Visualizar produtos** com fotos de alta qualidade
- **Consultar preços** de forma clara e organizada
- **Acessar especificações técnicas** detalhadas (calibre, marca, funcionamento, capacidade, etc.)
- **Navegar por categorias** (pistolas, revólveres, espingardas, carabinas, fuzis)
- **Exportar informações** dos produtos em PDF para compartilhamento
- **Ver produtos em destaque** na página inicial

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 16.1.5** - Framework React para aplicações web
- **React 19.2.3** - Biblioteca JavaScript para construção de interfaces
- **TypeScript 5** - Superset do JavaScript com tipagem estática
- **Tailwind CSS 4** - Framework CSS utilitário para estilização

### Backend & Banco de Dados
- **Supabase** - Plataforma Backend-as-a-Service (BaaS)
  - Banco de dados PostgreSQL
  - Autenticação de usuários
  - Row Level Security (RLS) para segurança
  - Storage para armazenamento de imagens

### Bibliotecas Adicionais
- **@supabase/supabase-js** - Cliente JavaScript para integração com Supabase
- **html2canvas** - Geração de imagens a partir de elementos HTML
- **jspdf** - Geração de documentos PDF

## 📊 Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas principais:

- **armas** - Cadastro principal de produtos com informações completas
- **marcas** - Catálogo de marcas de armas
- **calibres** - Catálogo de calibres disponíveis
- **funcionamento** - Tipos de funcionamento (semi-automático, repetição, etc.)
- **categorias** - Categorias de armas (pistola, revólver, espingarda, etc.)
- **fotos_armas** - Armazenamento de múltiplas fotos por produto

## 🔐 Segurança

O sistema implementa **Row Level Security (RLS)** no Supabase, garantindo que apenas usuários autenticados possam:
- Visualizar produtos
- Cadastrar novos produtos
- Editar produtos existentes
- Excluir produtos

## 📁 Migrações do Banco de Dados

Este diretório contém todas as migrações SQL necessárias para configurar o banco de dados. As migrações devem ser executadas na ordem numérica:

1. `001_create_armas.sql` - Criação da tabela principal de armas
2. `002_create_marcas.sql` - Criação da tabela de marcas
3. `003_create_calibres.sql` - Criação da tabela de calibres
4. `004_create_funcionamento.sql` - Criação da tabela de funcionamento
5. `005_add_delete_update_policies_armas.sql` - Políticas de segurança para armas
6. `006_add_storage_delete_policy.sql` - Políticas de storage
7. `007_create_fotos_armas.sql` - Tabela de fotos dos produtos
8. `008_add_em_destaque_column.sql` - Coluna para produtos em destaque
9. `009_add_rls_categorias.sql` - RLS para categorias
10. `010_create_categorias_table.sql` - Tabela de categorias
11. `011_fix_storage_policies.sql` - Correções nas políticas de storage
12. `012_fix_armas_schema.sql` - Correções no schema de armas
13. `014_fix_security_warnings.sql` - Correções de segurança
14. `016_fix_all_insert_update_delete_policies.sql` - Políticas completas de CRUD

## 🚀 Como Aplicar as Migrações

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard) e abra seu projeto
2. No menu lateral, vá em **SQL Editor**
3. Clique em **New query**
4. Execute as migrações na ordem numérica, copiando o conteúdo de cada arquivo e executando no editor SQL
5. Verifique se todas as tabelas e políticas foram criadas corretamente

## 📝 Funcionalidades Principais

- ✅ Cadastro completo de produtos com múltiplas fotos
- ✅ Sistema de categorização de produtos
- ✅ Busca e filtragem de produtos
- ✅ Página de detalhes do produto
- ✅ Dashboard com produtos em destaque
- ✅ Exportação de produtos em PDF
- ✅ Autenticação de usuários
- ✅ Interface responsiva e moderna

## 🔗 Integração com o Sistema

O Supabase serve como backend completo para o sistema, fornecendo:
- API REST automática através do cliente JavaScript
- Autenticação integrada
- Storage para imagens dos produtos
- Banco de dados relacional com relacionamentos entre tabelas
- Políticas de segurança em nível de linha (RLS)