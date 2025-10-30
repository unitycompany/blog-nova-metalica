# ✅ Checklist de Setup - Painel Admin

## 🎯 Configuração Inicial (Faça uma vez)

### Passo 1: Configurar Supabase
- [ ] Criar conta no [Supabase](https://supabase.com)
- [ ] Criar novo projeto
- [ ] Copiar **URL do projeto** (Settings → API)
- [ ] Copiar **anon/public key** (Settings → API)
- [ ] Abrir **SQL Editor**
- [ ] Colar e executar `scripts/db/setup_complete.sql`
- [ ] Aguardar mensagem de sucesso ✅

### Passo 2: Configurar Variáveis de Ambiente
- [ ] Criar arquivo `.env.local` na raiz do projeto
- [ ] Adicionar:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui
  NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
  SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key (somente backend)
  ```
- [ ] Salvar arquivo

### Passo 3: Criar Usuário Administrador (Supabase Auth)
- [ ] Abrir menu **Authentication → Users** no Supabase
- [ ] Clicar em **Invite user** ou **Add user**
- [ ] Definir email e senha que serão usados no login do painel
- [ ] (Opcional) Marcar metadado `is_admin: true` para organização
- [ ] Salvar usuário

### Passo 4: Instalar Dependências (se necessário)
- [ ] Abrir PowerShell na pasta do projeto
- [ ] Executar: `npm install`

### Passo 5: Iniciar Projeto
- [ ] Executar: `npm run dev`
- [ ] Aguardar mensagem "Ready on http://localhost:3000"
- [ ] Abrir navegador em `http://localhost:3000/admin`

---

## 📝 Primeiro Uso

### Criar Primeira Categoria
- [ ] Acessar `/admin`
- [ ] Clicar em aba **"📁 Categorias"**
- [ ] Clicar em **"➕ Nova Categoria"**
- [ ] Preencher:
  - Título: `Drywall`
  - Descrição: `Tudo sobre drywall`
  - Ordem: `1`
- [ ] Clicar em **"Salvar"**
- [ ] Verificar categoria na lista ✅

### Criar Primeiro Autor
- [ ] Clicar em aba **"👤 Autores"**
- [ ] Clicar em **"➕ Novo Autor"**
- [ ] Preencher:
  - Nome: `Seu Nome`
  - Bio: `Especialista em construção`
  - Email: `seu@email.com`
- [ ] Clicar em **"Salvar"**
- [ ] Verificar autor na lista ✅

### Criar Primeiro Artigo
- [ ] Clicar em aba **"📝 Artigos"**
- [ ] Clicar em **"➕ Novo Artigo"**
- [ ] Preencher campos obrigatórios:
  - Título: `Como instalar drywall`
  - Resumo: `Guia completo de instalação`
  - Conteúdo: `# Introdução\n\nConteúdo do artigo...`
  - Categoria: Selecionar `Drywall`
  - Autor: Selecionar seu nome
  - Status: `Publicado`
- [ ] Clicar em **"Salvar"**
- [ ] Verificar artigo na lista ✅

---

## 🎨 Personalização (Opcional)

### Alterar Cores
- [ ] Abrir `src/pages/admin/index.tsx`
- [ ] Procurar por `#ff6b35` (cor principal)
- [ ] Substituir por sua cor preferida
- [ ] Salvar e recarregar página

### Adicionar Logo
- [ ] Editar header em `src/pages/admin/index.tsx`
- [ ] Substituir emoji 🎯 por:
  ```tsx
  <img src="/logo.png" alt="Logo" style={{ height: '30px' }} />
  ```
- [ ] Adicionar arquivo `logo.png` em `public/`

### Mudar Título
- [ ] Editar `<h1>` em `src/pages/admin/index.tsx`
- [ ] Trocar "Blog Nova Metálica" pelo seu nome

---

## 🔍 Verificação de Funcionamento

### Testar APIs
- [ ] Artigos: `http://localhost:3000/api/articles`
- [ ] Categorias: `http://localhost:3000/api/categories`
- [ ] Autores: `http://localhost:3000/api/authors`
- [ ] Todos devem retornar JSON ✅

### Testar Formulários
- [ ] Criar artigo → ✅ Deve aparecer na lista
- [ ] Editar artigo → ✅ Mudanças devem persistir
- [ ] Excluir artigo → ✅ Deve remover da lista
- [ ] Mesmo teste para categorias e autores

### Testar Status
- [ ] Criar artigo como "Rascunho"
- [ ] Verificar que não aparece publicamente
- [ ] Mudar para "Publicado"
- [ ] Verificar que agora aparece ✅

---

## 🐛 Solução de Problemas Rápida

### ❌ Erro: "Failed to fetch"
- [ ] Verificar se `.env.local` existe
- [ ] Verificar se as variáveis estão corretas
- [ ] Verificar se Supabase está online
- [ ] Reiniciar servidor: `npm run dev`

### ❌ Erro: "Unique constraint violation"
- [ ] Trocar o slug do artigo/categoria/autor
- [ ] Slugs devem ser únicos

### ❌ Página em branco
- [ ] Abrir Console do navegador (F12)
- [ ] Ler mensagem de erro
- [ ] Verificar se executou script SQL no Supabase

### ❌ "Cannot read properties of undefined"
- [ ] Verificar se tabelas existem no Supabase
- [ ] Re-executar `setup_complete.sql`

---

## 📊 Uso Diário

### Workflow Recomendado
```
1. Criar Categorias → 📁
   └─ Organizar tópicos do blog

2. Criar Autores → 👤
   └─ Adicionar membros da equipe

3. Criar Artigos → 📝
   └─ Escrever conteúdo
   └─ Deixar como Rascunho
   └─ Revisar
   └─ Publicar quando pronto ✅
```

### Checklist Antes de Publicar Artigo
- [ ] Título atrativo e descritivo
- [ ] Slug otimizado (sem caracteres especiais)
- [ ] Resumo completo e interessante
- [ ] Conteúdo revisado (sem erros)
- [ ] Categoria correta selecionada
- [ ] Autor correto selecionado
- [ ] Imagem de capa adicionada
- [ ] SEO Título preenchido
- [ ] SEO Descrição preenchida
- [ ] Status = "Publicado"
- [ ] Salvar ✅

---

## 🚀 Deploy em Produção

### Antes de Deployar
- [ ] Testar tudo localmente
- [ ] Criar backup do banco (Supabase → Backups)
- [ ] Verificar `.env` de produção
- [ ] Testar em mobile

### Deploy Vercel
- [ ] Criar conta na [Vercel](https://vercel.com)
- [ ] Conectar repositório GitHub
- [ ] Adicionar variáveis de ambiente
- [ ] Deploy automático ✅

### Pós-Deploy
- [ ] Testar `/admin` em produção
- [ ] Criar artigo de teste
- [ ] Verificar se aparece no site
- [ ] Configurar domínio personalizado (opcional)

---

## 📈 Manutenção

### Semanal
- [ ] Verificar artigos em rascunho pendentes
- [ ] Revisar artigos publicados
- [ ] Backup do banco de dados

### Mensal
- [ ] Atualizar dependências: `npm update`
- [ ] Revisar logs de erro no Supabase
- [ ] Limpar artigos arquivados antigos

### Trimestral
- [ ] Revisar e atualizar artigos antigos
- [ ] Adicionar novas categorias se necessário
- [ ] Otimizar SEO dos artigos populares

---

## 🎓 Recursos de Aprendizado

### Para Iniciantes
- [ ] Ler `QUICK_START.md` completo
- [ ] Assistir tutorial de Markdown
- [ ] Praticar criando artigos de teste

### Para Avançados
- [ ] Ler `ADMIN_COMPLETE_DOCS.md`
- [ ] Estudar `ADMIN_COMMANDS.md`
- [ ] Personalizar interface

### Documentação
- [ ] [Supabase Docs](https://supabase.com/docs)
- [ ] [Next.js Docs](https://nextjs.org/docs)
- [ ] [Markdown Guide](https://www.markdownguide.org/)

---

## 💡 Dicas Profissionais

### SEO
- [ ] Sempre preencher título e descrição SEO
- [ ] Usar palavras-chave no slug
- [ ] Adicionar imagens com alt text
- [ ] Usar headings (H1, H2, H3) no Markdown

### Produtividade
- [ ] Usar atalhos de teclado
- [ ] Salvar rascunhos frequentemente
- [ ] Criar templates de artigos
- [ ] Agendar dias para publicações

### Qualidade
- [ ] Revisar antes de publicar
- [ ] Pedir feedback de colegas
- [ ] Usar gramática correta
- [ ] Adicionar exemplos e imagens

---

## ✅ Conclusão

Parabéns! Se você completou todos os itens acima, seu painel admin está:

- ✅ Configurado corretamente
- ✅ Funcionando perfeitamente
- ✅ Pronto para uso diário
- ✅ Pronto para produção

**Próximo passo**: Comece a criar conteúdo incrível! 🚀

---

**💬 Precisa de ajuda?**
- Consulte os arquivos de documentação
- Verifique o console do navegador (F12)
- Revise os passos deste checklist

**🎉 Bom trabalho!**
