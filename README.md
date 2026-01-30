# 🎣 Catálogo de Produtos - Pesca Sem Limites

Sistema de catálogo de produtos desenvolvido com Next.js, React e Supabase. Permite gerenciar produtos, categorias, marcas e exportar informações em PDF e imagem.

## 📋 Índice

- [Características](#-características)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Funcionalidades](#-funcionalidades)
- [Deploy](#-deploy)

## ✨ Características

- 🔐 **Autenticação**: Sistema de login seguro com Supabase Auth
- 📦 **CRUD Completo**: Criação, leitura, atualização e exclusão de produtos
- 🖼️ **Múltiplas Fotos**: Suporte a várias fotos por produto com ordenação
- 📄 **Exportação**: Geração de PDF e imagem dos produtos
- 🏷️ **Categorias**: Organização por categorias de produtos
- 🔍 **Filtros**: Busca e filtragem por marca, calibre e nome
- ⭐ **Destaques**: Sistema de produtos em destaque
- 💳 **Parcelamento**: Cálculo automático de parcelas com e sem juros
- 📱 **Responsivo**: Design adaptável para mobile e desktop
- 🎨 **UI Moderna**: Interface com efeitos glassmorphism e tema escuro

## 🛠️ Tecnologias

- **Framework**: [Next.js 16](https://nextjs.org/) com App Router
- **React**: Versão 19.2.3
- **TypeScript**: Tipagem estática
- **Estilização**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **Exportação**: 
  - [jsPDF](https://github.com/parallax/jsPDF) para PDFs
  - [html2canvas](https://github.com/niklasvh/html2canvas) para imagens

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Conta no [Supabase](https://supabase.com/)

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd catalogo
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

## ⚙️ Configuração

1. Crie um projeto no [Supabase](https://supabase.com/)

2. Configure as variáveis de ambiente. Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase
```

3. Execute as migrações do banco de dados. As migrações estão em `supabase/migrations/`. Execute-as na ordem numérica no seu projeto Supabase.

4. Configure o Storage no Supabase:
   - Crie um bucket chamado `fotos-armas`
   - Configure as políticas de acesso conforme necessário

## 💻 Uso

### Desenvolvimento

Execute o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### Build para Produção

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## 📁 Estrutura do Projeto

```
catalogo/
├── public/                 # Arquivos estáticos
│   ├── fundo/             # Imagens de fundo
│   ├── icons/             # Ícones das categorias
│   └── logo.png           # Logo da aplicação
├── src/
│   ├── app/               # Páginas e rotas (App Router)
│   │   ├── cadastros/     # Página de gerenciamento de produtos
│   │   ├── categorias/   # Página de categorias
│   │   ├── dashboard/    # Dashboard principal
│   │   ├── login/        # Página de login
│   │   ├── produto/      # Página de detalhes do produto
│   │   └── produtos/     # Listagem de produtos
│   ├── components/        # Componentes reutilizáveis
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── hooks/            # Custom hooks
│   │   └── useAuth.ts
│   └── lib/              # Utilitários e configurações
│       ├── exportProduct.ts
│       └── supabaseClient.ts
├── supabase/
│   └── migrations/       # Migrações do banco de dados
└── package.json
```

## 🎯 Funcionalidades

### Autenticação
- Login com email e senha
- Proteção de rotas com autenticação
- Logout seguro

### Gerenciamento de Produtos
- **Criar**: Adicionar novos produtos com todas as informações
- **Listar**: Visualizar todos os produtos com paginação
- **Editar**: Atualizar informações dos produtos
- **Excluir**: Remover produtos do catálogo
- **Filtros**: Buscar por nome, marca ou calibre

### Fotos
- Upload de múltiplas fotos por produto
- Ordenação das fotos
- Preview antes do upload
- Remoção de fotos existentes

### Exportação
- **PDF**: Geração de PDF com informações do produto
- **Imagem**: Exportação como imagem PNG (1000x1500px)
- Inclui logo, foto, especificações e preço

### Categorias
- Visualização por categoria
- Navegação entre categorias
- Ícones personalizados por categoria

### Parcelamento
- Cálculo automático de parcelas
- Até 4x sem juros
- Até 10x com juros de 8%
- Modal com todas as opções

## 🗄️ Banco de Dados

O projeto utiliza Supabase (PostgreSQL) com as seguintes tabelas principais:

- `armas`: Produtos cadastrados
- `marcas`: Marcas dos produtos
- `calibres`: Calibres disponíveis
- `funcionamento`: Tipos de funcionamento
- `categorias`: Categorias de produtos
- `fotos_armas`: Fotos dos produtos

## 🔒 Segurança

- Row Level Security (RLS) habilitado no Supabase
- Políticas de acesso configuradas
- Autenticação obrigatória para operações sensíveis
- Validação de dados no frontend e backend

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Importe o projeto na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente
4. Deploy automático a cada push

### Outras Plataformas

O projeto pode ser deployado em qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

## 📝 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Cria o build de produção
- `npm start`: Inicia o servidor de produção
- `npm run lint`: Executa o linter

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

## 👨‍💻 Autor

Desenvolvido para Pesca Sem Limites

---

⭐ Se este projeto foi útil, considere dar uma estrela!
