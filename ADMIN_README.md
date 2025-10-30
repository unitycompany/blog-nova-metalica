# 🎯 Painel Admin - Blog Nova Metálica

## 📋 Como Usar

### 1. Configurar Supabase

Primeiro, você precisa executar os scripts SQL no Supabase:

1. Acesse seu projeto no [Supabase](https://supabase.com)
2. Vá em **SQL Editor**
3. Execute o arquivo `scripts/db/001_initial_schema.sql`
4. Execute o arquivo `scripts/db/002_rls_policies.sql`

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 3. Acessar o Admin

Execute o projeto e acesse:

```
http://localhost:3000/admin
```

## 🚀 Funcionalidades

### ✍️ Artigos
- Criar, editar e excluir artigos
- Suporte a Markdown no conteúdo
- Status: Rascunho, Publicado, Arquivado
- Relacionar com categorias e autores
- Campos de SEO completos
- Geração automática de slug

### 📁 Categorias
- Criar, editar e excluir categorias
- Organizar por ordem de exibição
- Controle de indexação
- Geração automática de slug

### 👤 Autores
- Criar, editar e excluir autores
- Foto de perfil
- Bio e credenciais
- Redes sociais (Twitter, LinkedIn)
- Website pessoal

## 📝 Fluxo de Trabalho

### Criando um Artigo:

1. Clique em **"📝 Artigos"**
2. Clique em **"➕ Novo Artigo"**
3. Preencha os campos obrigatórios:
   - **Título**: Ao sair do campo, o slug será gerado automaticamente
   - **Resumo**: Descrição breve
   - **Conteúdo**: Use Markdown
   - **Categoria**: Selecione da lista
   - **Autor**: Selecione da lista
4. Configure campos opcionais de SEO
5. Escolha o status:
   - **Rascunho**: Não será visível publicamente
   - **Publicado**: Visível no site
   - **Arquivado**: Oculto mas mantido no banco
6. Clique em **"Salvar"**

### Criando uma Categoria:

1. Clique em **"📁 Categorias"**
2. Clique em **"➕ Nova Categoria"**
3. Preencha:
   - **Título**: Nome da categoria
   - **Slug**: URL amigável (gerado automaticamente)
   - **Descrição**: Opcional
   - **Ordem**: Define a ordem de exibição
4. Clique em **"Salvar"**

### Criando um Autor:

1. Clique em **"👤 Autores"**
2. Clique em **"➕ Novo Autor"**
3. Preencha:
   - **Nome**: Nome completo
   - **Slug**: Identificador (gerado automaticamente)
   - **Bio**: Biografia
   - **Email**: Contato
   - **Avatar**: URL da foto
   - **Redes Sociais**: Links opcionais
   - **Credenciais**: Títulos e qualificações
4. Clique em **"Salvar"**

## 🎨 Interface

A interface foi projetada para ser **simples e intuitiva**:

- ✅ **Visual limpo** sem elementos desnecessários
- ✅ **Abas organizadas** para cada tipo de conteúdo
- ✅ **Formulários claros** com campos bem identificados
- ✅ **Feedback visual** com cores e ícones
- ✅ **Geração automática de slugs** ao sair do campo título
- ✅ **Validação de campos** obrigatórios
- ✅ **Confirmação antes de excluir** itens

## 🔒 Segurança

O sistema usa **Row Level Security (RLS)** do Supabase:

- **Leitura pública**: Qualquer pessoa pode ler artigos publicados
- **Escrita protegida**: Apenas usuários autenticados podem criar/editar/excluir
- **Artigos em rascunho**: Só visíveis para usuários autenticados

## 📊 Campos do Artigo

### Obrigatórios:
- Título
- Slug
- Resumo (excerpt)
- Conteúdo
- Categoria
- Autor

### Opcionais (SEO):
- SEO Título
- SEO Descrição
- Imagem de capa
- URL canônica
- Tags
- E muitos outros...

## 🛠️ Tecnologias Utilizadas

- **Next.js**: Framework React
- **Supabase**: Banco de dados PostgreSQL
- **TypeScript**: Tipagem estática
- **Contentlayer**: Para processar MDX (se necessário)

## 💡 Dicas

1. **Sempre preencha o SEO Título e Descrição** para melhor ranqueamento
2. **Use slugs descritivos** com palavras-chave
3. **Adicione imagens de capa** para melhor compartilhamento social
4. **Revise o conteúdo** antes de mudar o status para "Publicado"
5. **Use Markdown** no conteúdo para formatação rica

## 🐛 Solução de Problemas

### "Erro ao carregar..."
- Verifique se as variáveis de ambiente estão corretas
- Confirme que os scripts SQL foram executados no Supabase

### "Erro ao salvar..."
- Verifique se todos os campos obrigatórios foram preenchidos
- Confirme que o slug é único (não existe outro com o mesmo)

### Página em branco
- Abra o console do navegador (F12) para ver erros
- Verifique se o Supabase está acessível

## 📞 Suporte

Em caso de dúvidas ou problemas, verifique:
1. Console do navegador (F12)
2. Logs do Supabase
3. Conexão com a internet
