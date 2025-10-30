# 🚀 Guia Rápido - Painel Admin

## ⚡ Setup em 3 Passos

### 1️⃣ Configure o Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Crie um novo projeto (ou use um existente)
3. Vá em **SQL Editor** (ícone de banco de dados na lateral)
4. Cole e execute o conteúdo do arquivo `scripts/db/setup_complete.sql`
5. Aguarde a mensagem de sucesso ✅

### 2️⃣ Configure as Variáveis de Ambiente

1. No Supabase, vá em **Settings** → **API**
2. Copie a **URL** e a **anon/public key**
3. Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=cole-a-url-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=cole-a-chave-aqui
```

### 3️⃣ Execute o Projeto

```bash
npm run dev
```

Acesse: **http://localhost:3000/admin**

---

## 🎯 Primeiro Uso

### Criar seu primeiro artigo:

1. Acesse `/admin`
2. Clique em **"📝 Artigos"**
3. Clique em **"➕ Novo Artigo"**
4. Preencha:
   - **Título**: "Meu Primeiro Artigo"
   - **Resumo**: "Este é um teste"
   - **Conteúdo**: Digite qualquer texto
   - **Categoria**: Selecione uma
   - **Autor**: Selecione "Administrador"
   - **Status**: Escolha "Publicado"
5. Clique em **"Salvar"** ✅

Pronto! Seu primeiro artigo está criado! 🎉

---

## 📱 Interface Intuitiva

A interface foi projetada para ser **extremamente simples**:

- 🎨 **Design limpo** - Sem poluição visual
- 🔍 **Tudo visível** - Sem menus escondidos
- ⚡ **Ações rápidas** - Editar/Excluir com 1 clique
- 📝 **Auto-complete** - Slugs gerados automaticamente
- ✅ **Validação clara** - Campos obrigatórios bem indicados

---

## 🆘 Problemas Comuns

### ❌ "Error loading data"
**Solução**: Verifique se executou o script SQL no Supabase

### ❌ "Network error" 
**Solução**: Verifique as variáveis de ambiente no `.env.local`

### ❌ Página em branco
**Solução**: Abra o console (F12) e veja o erro específico

---

## 💡 Dicas Rápidas

✅ **O slug é gerado automaticamente** quando você sai do campo "Título"  
✅ **Use Markdown** no conteúdo para formatação rica  
✅ **Rascunhos não aparecem** no site público  
✅ **Sempre preencha os campos de SEO** para melhor ranqueamento  
✅ **Categorias e autores** devem ser criados antes dos artigos  

---

## 📊 Status dos Artigos

| Status | Significado |
|--------|-------------|
| 🟡 **Rascunho** | Visível apenas no admin |
| 🟢 **Publicado** | Visível publicamente no site |
| ⚫ **Arquivado** | Oculto mas mantido no banco |

---

## 🎓 Tutoriais em Vídeo (Recomendado)

Se preferir aprender vendo:

1. **Como criar categorias** (30 segundos)
2. **Como criar autores** (30 segundos)
3. **Como criar seu primeiro artigo** (2 minutos)

> Nota: Grave você mesmo um screencast curto se precisar treinar sua equipe!

---

## 🔒 Segurança

- ✅ Apenas usuários autenticados podem criar/editar
- ✅ Artigos em rascunho não são públicos
- ✅ RLS (Row Level Security) ativado no Supabase

---

## 📞 Suporte

Algo não funcionou?

1. Verifique o console do navegador (F12)
2. Confirme que o Supabase está online
3. Revise as variáveis de ambiente

---

**Pronto para começar? Acesse `/admin` e crie seu conteúdo! 🚀**
