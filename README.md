# 🏗️ Blog Nova Metálica

Blog profissional sobre construção civil com foco em drywall, steel frame, acústica e forros.

## 🚀 Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Supabase** - Banco de dados PostgreSQL
- **Contentlayer** - Processamento de MDX
- **Emotion** - CSS-in-JS

## 🎯 Características

- ✅ **Painel Admin Completo** - Gerenciar artigos, categorias e autores
- ✅ **Contentlayer** - Suporte a MDX para artigos ricos
- ✅ **SEO Otimizado** - Meta tags, Open Graph, Schema.org
- ✅ **Responsive** - Design adaptativo para todos os dispositivos
- ✅ **Performance** - Otimizado para Core Web Vitals
- ✅ **Supabase** - Backend escalável e seguro

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start
```

## 🎨 Painel Admin

Acesse o painel administrativo em: **`http://localhost:3000/admin`**

### Documentação do Admin:
- 📘 [Setup Checklist](SETUP_CHECKLIST.md) - Lista de verificação passo a passo
- 📗 [Quick Start](QUICK_START.md) - Guia rápido de início
- 📕 [Documentação Completa](ADMIN_COMPLETE_DOCS.md) - Guia completo
- 📙 [Comandos Úteis](ADMIN_COMMANDS.md) - SQL e comandos de terminal

### Funcionalidades do Admin:
- 📝 **Artigos**: Criar, editar, publicar, arquivar
- 📁 **Categorias**: Organizar por tópicos
- 👤 **Autores**: Gerenciar perfis e credenciais
- 🎨 **Interface Intuitiva**: Design simples e funcional
- 🔐 **Seguro**: Row Level Security (RLS)

### Autenticação do Admin
- Crie usuários administradores diretamente no Supabase (`Authentication > Users`).
- Use email e senha cadastrados no Supabase para acessar `/admin`.
- Tokens de sessão ficam armazenados em cookie HTTP-only e são renovados automaticamente.

## 🗄️ Setup do Banco de Dados

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Execute o script SQL em **SQL Editor**:
   ```sql
   -- Cole o conteúdo de: scripts/db/setup_complete.sql
   ```
4. Configure as variáveis de ambiente no `.env.local`

## 🌐 Estrutura do Projeto

```
blog-nm/
├── src/
│   ├── pages/          # Páginas Next.js
│   │   ├── admin/      # Painel administrativo
│   │   ├── api/        # API Routes
│   │   └── blog/       # Páginas de blog
│   ├── components/     # Componentes React
│   │   ├── admin/      # Componentes do admin
│   │   └── ui/         # Componentes de UI
│   ├── lib/            # Utilitários
│   │   ├── repositories/  # Repositórios Supabase
│   │   └── validation/    # Validações
│   ├── content/        # Conteúdo estático
│   └── styles/         # Estilos globais
├── posts/              # Artigos em MDX
├── scripts/            # Scripts SQL
│   └── db/             # Schemas e migrations
└── public/             # Arquivos estáticos
```

## 📝 Criar um Artigo

### Via Admin (Recomendado):
1. Acesse `/admin`
2. Clique em "📝 Artigos" → "➕ Novo Artigo"
3. Preencha os campos
4. Clique em "Salvar"

### Via MDX (Alternativo):
Crie um arquivo `.mdx` em `posts/`:

```mdx
---
title: "Como instalar drywall"
subtitle: "Guia completo passo a passo"
excerpt: "Aprenda a instalar drywall como um profissional"
author: "admin"
category: "drywall"
date: 2025-01-15
lang: pt-BR
cover_asset_id: "image-id"
site_id: "blog-nm"
---

# Introdução

Conteúdo do artigo em Markdown...
```

## 🔐 Segurança

O projeto usa **Row Level Security (RLS)** do Supabase:

- ✅ Leitura pública de artigos publicados
- ✅ Escrita apenas para usuários autenticados
- ✅ Artigos em rascunho visíveis apenas no admin

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

### Variáveis de Ambiente em Produção:
```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-de-producao
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-de-producao
```

## 📊 API Routes

- `GET /api/articles` - Listar artigos
- `POST /api/articles` - Criar artigo
- `GET /api/articles/[id]` - Buscar artigo
- `PUT /api/articles/[id]` - Atualizar artigo
- `DELETE /api/articles/[id]` - Deletar artigo

Mesmas rotas para `/api/categories` e `/api/authors`

## 🎓 Documentação

- [Setup Checklist](SETUP_CHECKLIST.md) - ⚡ Início rápido
- [Quick Start Guide](QUICK_START.md) - 📖 Guia básico
- [Admin Complete Docs](ADMIN_COMPLETE_DOCS.md) - 📚 Documentação completa
- [Admin Commands](ADMIN_COMMANDS.md) - 🛠️ Comandos úteis

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Adicionar nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e propriedade da Nova Metálica.

## 🆘 Suporte

- 📧 Email: contato@novametalica.com.br
- 📖 Docs: Veja os arquivos MD na raiz do projeto
- 🐛 Issues: Abra uma issue no GitHub

## ✨ Próximos Passos

Depois de configurar o projeto:

1. ✅ Execute o script SQL no Supabase
2. ✅ Configure `.env.local`
3. ✅ Execute `npm run dev`
4. ✅ Acesse `/admin`
5. ✅ Crie suas primeiras categorias e autores
6. ✅ Publique seu primeiro artigo

**🎉 Pronto! Seu blog está funcionando!**
