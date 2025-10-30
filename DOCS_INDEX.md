# 📚 Índice de Documentação - Painel Admin

## 🎯 Por onde começar?

### Nunca usei antes?
👉 **Comece aqui**: [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
- Lista passo a passo
- Checkboxes para marcar progresso
- Ideal para iniciantes

### Quer começar rápido?
👉 **Leia isto**: [QUICK_START.md](QUICK_START.md)
- 3 passos simples
- Sem detalhes técnicos
- Direto ao ponto

### Precisa de detalhes?
👉 **Documentação completa**: [ADMIN_COMPLETE_DOCS.md](ADMIN_COMPLETE_DOCS.md)
- Guia completo de todas as funcionalidades
- Estrutura do banco de dados
- Personalização e melhorias

### Precisa de comandos SQL/Terminal?
👉 **Comandos úteis**: [ADMIN_COMMANDS.md](ADMIN_COMMANDS.md)
- Queries SQL prontas
- Comandos PowerShell
- Backup e restore
- Troubleshooting

---

## 📂 Arquivos do Projeto

### 🗄️ Banco de Dados
- `scripts/db/001_initial_schema.sql` - Schema das tabelas
- `scripts/db/002_rls_policies.sql` - Políticas de segurança
- `scripts/db/setup_complete.sql` - **Script completo (USE ESTE!)**

### 🔧 Backend
- `src/lib/supabase.ts` - Cliente Supabase + Types
- `src/lib/env.ts` - Variáveis de ambiente
- `src/lib/repositories/articles.ts` - CRUD de artigos
- `src/lib/repositories/categories.ts` - CRUD de categorias
- `src/lib/repositories/authors.ts` - CRUD de autores

### 🌐 API
- `src/pages/api/articles/` - Endpoints de artigos
- `src/pages/api/categories/` - Endpoints de categorias
- `src/pages/api/authors/` - Endpoints de autores

### 🎨 Interface
- `src/pages/admin/index.tsx` - **Painel admin completo**
- `src/components/admin/Toast.tsx` - Notificações
- `src/styles/admin.css` - Estilos do admin

### 📄 Configuração
- `.env.local.example` - Exemplo de variáveis
- `README.md` - Documentação principal do projeto

---

## 🎓 Fluxo de Aprendizado Recomendado

### Nível 1: Básico (30 minutos)
1. ✅ Ler [QUICK_START.md](QUICK_START.md)
2. ✅ Executar script SQL no Supabase
3. ✅ Configurar `.env.local`
4. ✅ Rodar `npm run dev`
5. ✅ Acessar `/admin`
6. ✅ Criar 1 categoria, 1 autor, 1 artigo

### Nível 2: Intermediário (1 hora)
1. ✅ Ler [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) completo
2. ✅ Explorar todas as abas do admin
3. ✅ Testar criar/editar/excluir em cada seção
4. ✅ Entender status de artigos (draft/published/archived)
5. ✅ Preencher campos de SEO

### Nível 3: Avançado (2-3 horas)
1. ✅ Ler [ADMIN_COMPLETE_DOCS.md](ADMIN_COMPLETE_DOCS.md)
2. ✅ Estudar estrutura do banco de dados
3. ✅ Explorar [ADMIN_COMMANDS.md](ADMIN_COMMANDS.md)
4. ✅ Executar queries SQL customizadas
5. ✅ Personalizar cores e interface

### Nível 4: Expert (1 dia)
1. ✅ Modificar schema do banco
2. ✅ Adicionar novos campos
3. ✅ Criar novas funcionalidades
4. ✅ Integrar upload de imagens
5. ✅ Deploy em produção

---

## 🔍 Busca Rápida

### Preciso saber como...

#### Configurar pela primeira vez
→ [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) - Seção "Configuração Inicial"

#### Criar meu primeiro artigo
→ [QUICK_START.md](QUICK_START.md) - Seção "Primeiro Uso"

#### Alterar cores do painel
→ [ADMIN_COMPLETE_DOCS.md](ADMIN_COMPLETE_DOCS.md) - Seção "Personalização"

#### Executar queries SQL
→ [ADMIN_COMMANDS.md](ADMIN_COMMANDS.md) - Seção "Supabase - Comandos SQL"

#### Fazer backup do banco
→ [ADMIN_COMMANDS.md](ADMIN_COMMANDS.md) - Seção "Backup & Restore"

#### Resolver erro "Failed to fetch"
→ [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) - Seção "Solução de Problemas"

#### Ver todas as categorias no banco
→ [ADMIN_COMMANDS.md](ADMIN_COMMANDS.md) - Busque por "Ver todas as tabelas"

#### Deploy em produção
→ [ADMIN_COMPLETE_DOCS.md](ADMIN_COMPLETE_DOCS.md) - Seção "Deploy"

#### Adicionar novo campo em artigos
→ [ADMIN_COMPLETE_DOCS.md](ADMIN_COMPLETE_DOCS.md) - Seção "Adicionar Novos Campos"

---

## 🆘 Solução de Problemas

### Por tipo de erro:

| Erro | Onde encontrar solução |
|------|------------------------|
| "Failed to fetch" | [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) |
| "Unique constraint" | [ADMIN_COMMANDS.md](ADMIN_COMMANDS.md) |
| Página em branco | [QUICK_START.md](QUICK_START.md) |
| Erro de SQL | [ADMIN_COMMANDS.md](ADMIN_COMMANDS.md) |
| Erro de TypeScript | [ADMIN_COMPLETE_DOCS.md](ADMIN_COMPLETE_DOCS.md) |

---

## 📊 Comparação de Documentos

| Documento | Tamanho | Nível | Quando Usar |
|-----------|---------|-------|-------------|
| [QUICK_START.md](QUICK_START.md) | Curto | Iniciante | Primeira vez |
| [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) | Médio | Iniciante | Setup + Uso diário |
| [ADMIN_COMPLETE_DOCS.md](ADMIN_COMPLETE_DOCS.md) | Longo | Intermediário | Referência completa |
| [ADMIN_COMMANDS.md](ADMIN_COMMANDS.md) | Médio | Avançado | Comandos específicos |

---

## 💡 Dicas de Uso

### Para não-programadores:
1. Comece com [QUICK_START.md](QUICK_START.md)
2. Use [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) como guia
3. Ignore partes técnicas de SQL
4. Foque apenas na interface `/admin`

### Para programadores:
1. Ler [ADMIN_COMPLETE_DOCS.md](ADMIN_COMPLETE_DOCS.md) primeiro
2. Estudar estrutura do banco
3. Explorar [ADMIN_COMMANDS.md](ADMIN_COMMANDS.md)
4. Personalizar conforme necessidade

### Para administradores de conteúdo:
1. [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) - Seção "Uso Diário"
2. Aprender atalhos da interface
3. Criar templates de artigos
4. Manter backup regular

---

## 🎯 Objetivos de Cada Documento

### QUICK_START.md
**Objetivo**: Fazer você começar em 5 minutos  
**Foco**: Ação rápida, zero teoria

### SETUP_CHECKLIST.md
**Objetivo**: Guia completo de setup + uso  
**Foco**: Passo a passo com checkboxes

### ADMIN_COMPLETE_DOCS.md
**Objetivo**: Documentação de referência  
**Foco**: Todos os detalhes técnicos

### ADMIN_COMMANDS.md
**Objetivo**: Comandos prontos para copiar  
**Foco**: SQL, terminal, troubleshooting

---

## 📞 Suporte

### Antes de pedir ajuda:

1. ✅ Verifique [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) - Seção "Problemas Comuns"
2. ✅ Console do navegador (F12) para ver erros
3. ✅ Logs do Supabase
4. ✅ Verifique `.env.local`

### Se ainda tiver problemas:

- 📧 Email: contato@novametalica.com.br
- 📖 Revise todos os documentos acima
- 🐛 Abra uma issue no GitHub

---

## ✨ Começar Agora

**Nunca usou?** → [QUICK_START.md](QUICK_START.md)  
**Quer checklist?** → [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)  
**Precisa de tudo?** → [ADMIN_COMPLETE_DOCS.md](ADMIN_COMPLETE_DOCS.md)  
**Só comandos?** → [ADMIN_COMMANDS.md](ADMIN_COMMANDS.md)

---

**🎉 Escolha seu caminho e comece a usar o painel admin!**
