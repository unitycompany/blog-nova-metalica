# 🛠️ Comandos Úteis - Painel Admin

## 🚀 Desenvolvimento

### Iniciar servidor de desenvolvimento
```powershell
npm run dev
```

### Build para produção
```powershell
npm run build
```

### Iniciar em modo produção
```powershell
npm start
```

---

## 🗄️ Supabase - Comandos SQL

### Ver todas as tabelas
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Contar registros
```sql
SELECT 
  (SELECT COUNT(*) FROM articles) as total_artigos,
  (SELECT COUNT(*) FROM categories) as total_categorias,
  (SELECT COUNT(*) FROM authors) as total_autores;
```

### Ver artigos publicados
```sql
SELECT id, title, status, published_at 
FROM articles 
WHERE status = 'published'
ORDER BY published_at DESC;
```

### Ver artigos por categoria
```sql
SELECT a.title, c.title as categoria
FROM articles a
LEFT JOIN categories c ON a.category_id = c.id
ORDER BY c.title, a.title;
```

### Ver artigos por autor
```sql
SELECT a.title, au.name as autor
FROM articles a
LEFT JOIN authors au ON a.author_id = au.id
ORDER BY au.name, a.title;
```

### Backup de dados (export)
```sql
-- Copie o resultado e salve em arquivo .json
SELECT json_agg(row_to_json(articles)) FROM articles;
SELECT json_agg(row_to_json(categories)) FROM categories;
SELECT json_agg(row_to_json(authors)) FROM authors;
```

### Limpar todas as tabelas (CUIDADO!)
```sql
TRUNCATE articles CASCADE;
TRUNCATE categories CASCADE;
TRUNCATE authors CASCADE;
```

### Resetar auto-increment (se necessário)
```sql
-- Para PostgreSQL/Supabase não é necessário
-- UUIDs são gerados automaticamente
```

---

## 📊 Queries Úteis

### Artigos sem categoria
```sql
SELECT id, title 
FROM articles 
WHERE category_id IS NULL;
```

### Artigos sem autor
```sql
SELECT id, title 
FROM articles 
WHERE author_id IS NULL;
```

### Categorias mais usadas
```sql
SELECT c.title, COUNT(a.id) as total
FROM categories c
LEFT JOIN articles a ON c.id = a.category_id
GROUP BY c.id, c.title
ORDER BY total DESC;
```

### Autores mais produtivos
```sql
SELECT au.name, COUNT(a.id) as total_artigos
FROM authors au
LEFT JOIN articles a ON au.id = a.author_id
GROUP BY au.id, au.name
ORDER BY total_artigos DESC;
```

### Artigos criados hoje
```sql
SELECT id, title, created_at
FROM articles
WHERE created_at::date = CURRENT_DATE;
```

### Artigos atualizados recentemente (últimos 7 dias)
```sql
SELECT id, title, updated_at
FROM articles
WHERE updated_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY updated_at DESC;
```

---

## 🔧 Manutenção

### Verificar integridade
```sql
-- Verificar artigos órfãos (sem autor ou categoria existente)
SELECT a.id, a.title, a.author_id, a.category_id
FROM articles a
LEFT JOIN authors au ON a.author_id = au.id
LEFT JOIN categories c ON a.category_id = c.id
WHERE (a.author_id IS NOT NULL AND au.id IS NULL)
   OR (a.category_id IS NOT NULL AND c.id IS NULL);
```

### Atualizar todos os slugs automaticamente
```sql
-- Exemplo: gerar slugs a partir do título
UPDATE articles 
SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';
```

### Migrar categorias
```sql
-- Exemplo: mover todos os artigos de uma categoria para outra
UPDATE articles 
SET category_id = 'novo-id-uuid'
WHERE category_id = 'antigo-id-uuid';
```

---

## 📦 Backup & Restore

### Backup completo via Supabase CLI
```powershell
# Instalar Supabase CLI
npm install -g supabase

# Fazer login
supabase login

# Backup
supabase db dump -f backup.sql
```

### Restore
```powershell
supabase db push backup.sql
```

### Backup manual (via painel)
1. Vá em **Database** → **Backups**
2. Clique em **Download backup**
3. Salve o arquivo `.sql`

---

## 🧪 Testes

### Criar dados de teste
```sql
-- Inserir autor de teste
INSERT INTO authors (name, slug, bio)
VALUES ('Teste Author', 'teste-author', 'Autor de testes');

-- Inserir categoria de teste
INSERT INTO categories (slug, title, description, order_index)
VALUES ('teste', 'Teste', 'Categoria de teste', 99);

-- Inserir artigo de teste
INSERT INTO articles (
  slug, title, excerpt, content, status, lang,
  author_id, category_id
)
SELECT 
  'artigo-teste',
  'Artigo de Teste',
  'Este é um artigo de teste',
  '# Conteúdo de Teste\n\nTexto de exemplo.',
  'draft',
  'pt-BR',
  (SELECT id FROM authors WHERE slug = 'teste-author' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'teste' LIMIT 1);
```

### Limpar dados de teste
```sql
DELETE FROM articles WHERE slug = 'artigo-teste';
DELETE FROM categories WHERE slug = 'teste';
DELETE FROM authors WHERE slug = 'teste-author';
```

---

## 🔐 Segurança

### Ver políticas RLS
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Verificar se RLS está ativo
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### Desabilitar RLS (NÃO RECOMENDADO)
```sql
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE authors DISABLE ROW LEVEL SECURITY;
```

### Habilitar RLS novamente
```sql
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
```

---

## 📈 Performance

### Ver índices existentes
```sql
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Criar índice adicional (exemplo)
```sql
-- Índice para busca por título
CREATE INDEX idx_articles_title ON articles USING gin(to_tsvector('portuguese', title));
```

### Analisar performance de query
```sql
EXPLAIN ANALYZE
SELECT * FROM articles 
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 10;
```

---

## 🔄 Migrations

### Adicionar nova coluna
```sql
-- Exemplo: adicionar campo "views" em articles
ALTER TABLE articles ADD COLUMN views INTEGER DEFAULT 0;
```

### Renomear coluna
```sql
ALTER TABLE articles RENAME COLUMN old_name TO new_name;
```

### Remover coluna
```sql
ALTER TABLE articles DROP COLUMN column_name;
```

### Modificar tipo de coluna
```sql
ALTER TABLE articles ALTER COLUMN column_name TYPE new_type;
```

---

## 💻 Next.js

### Limpar cache
```powershell
Remove-Item -Path .next -Recurse -Force
```

### Ver rotas disponíveis
```powershell
# Após build
npm run build
# As rotas aparecem no output
```

### Verificar erros TypeScript
```powershell
npx tsc --noEmit
```

---

## 🌐 Deploy

### Vercel (Recomendado)
```powershell
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### Netlify
```powershell
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Deploy para produção
netlify deploy --prod
```

---

## 📝 Git

### Commit inicial
```powershell
git add .
git commit -m "feat: adicionar painel admin completo"
git push
```

### Criar branch para feature
```powershell
git checkout -b feature/admin-improvements
```

### Merge na main
```powershell
git checkout main
git merge feature/admin-improvements
git push
```

---

## 🎯 Atalhos PowerShell

### Criar alias úteis
Adicione no seu perfil PowerShell (`$PROFILE`):

```powershell
# Atalhos para o projeto
function dev { npm run dev }
function build { npm run build }
function admin { Start-Process "http://localhost:3000/admin" }

# Atalhos Supabase
function sb-status { supabase status }
function sb-logs { supabase logs }
```

---

## 📞 Suporte

Se algo não funcionar:

1. **Verifique logs:**
   ```powershell
   # Logs do Next.js aparecem no terminal
   npm run dev
   ```

2. **Verifique console do navegador:**
   - Pressione F12
   - Vá em "Console"
   - Veja os erros em vermelho

3. **Verifique Supabase:**
   - Acesse o painel do Supabase
   - Vá em "Logs"
   - Filtre por erros

---

**Dica**: Salve este arquivo como favorito para consultas rápidas! 📌
