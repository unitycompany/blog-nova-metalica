-- Script de setup completo
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- 1. CRIAR TABELAS
-- ========================================

-- Tabela de Autores
CREATE TABLE IF NOT EXISTS authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    email TEXT,
    twitter TEXT,
    linkedin TEXT,
    website TEXT,
    credentials TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    og_image TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    order_index INTEGER DEFAULT 0,
    synonyms TEXT[],
    ai_hints TEXT[],
    is_indexed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Artigos
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    excerpt TEXT,
    content TEXT NOT NULL,
    author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Dados de publicação
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- SEO
    seo_title TEXT,
    seo_description TEXT,
    og_image TEXT,
    canonical_url TEXT,
    robots_index TEXT DEFAULT 'index',
    robots_follow TEXT DEFAULT 'follow',
    
    -- Imagens
    cover_image TEXT,
    cover_blurhash TEXT,
    cover_dominant_color TEXT,
    
    -- Metadata
    lang TEXT DEFAULT 'pt-BR',
    reading_time INTEGER,
    word_count INTEGER,
    tags TEXT[],
    
    -- EEAT
    reviewed_by TEXT,
    reviewer_credentials TEXT,
    fact_checked BOOLEAN DEFAULT false,
    
    -- Relacionamentos
    related_articles UUID[],
    
    -- Schema.org
    tldr TEXT,
    key_takeaways TEXT[],
    faq JSONB
);

-- ========================================
-- 2. CRIAR ÍNDICES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors(slug);

-- ========================================
-- 3. CRIAR FUNÇÕES E TRIGGERS
-- ========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_authors_updated_at ON authors;
CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 4. HABILITAR RLS (Row Level Security)
-- ========================================

ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. CRIAR POLÍTICAS DE SEGURANÇA
-- ========================================

-- Limpar políticas existentes
DROP POLICY IF EXISTS "Allow public read access on authors" ON authors;
DROP POLICY IF EXISTS "Allow public read access on categories" ON categories;
DROP POLICY IF EXISTS "Allow public read access on published articles" ON articles;
DROP POLICY IF EXISTS "Allow authenticated users to insert authors" ON authors;
DROP POLICY IF EXISTS "Allow authenticated users to update authors" ON authors;
DROP POLICY IF EXISTS "Allow authenticated users to delete authors" ON authors;
DROP POLICY IF EXISTS "Allow authenticated users to insert categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to update categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to delete categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to insert articles" ON articles;
DROP POLICY IF EXISTS "Allow authenticated users to update articles" ON articles;
DROP POLICY IF EXISTS "Allow authenticated users to delete articles" ON articles;

-- Políticas para leitura pública
CREATE POLICY "Allow public read access on authors"
    ON authors FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access on categories"
    ON categories FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access on published articles"
    ON articles FOR SELECT
    USING (status = 'published' OR auth.role() = 'authenticated');

-- Políticas para escrita (apenas usuários autenticados)
CREATE POLICY "Allow authenticated users to insert authors"
    ON authors FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update authors"
    ON authors FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to delete authors"
    ON authors FOR DELETE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert categories"
    ON categories FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update categories"
    ON categories FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to delete categories"
    ON categories FOR DELETE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert articles"
    ON articles FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update articles"
    ON articles FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to delete articles"
    ON articles FOR DELETE
    TO authenticated
    USING (true);

-- ========================================
-- 6. INSERIR DADOS INICIAIS (OPCIONAL)
-- ========================================

-- Inserir autor padrão
INSERT INTO authors (name, slug, bio, credentials)
VALUES (
    'Administrador',
    'admin',
    'Equipe editorial do Blog Nova Metálica',
    'Especialista em construção civil'
)
ON CONFLICT (slug) DO NOTHING;

-- Inserir categorias iniciais
INSERT INTO categories (slug, title, description, order_index, is_indexed)
VALUES
    ('drywall', 'Drywall', 'Tudo sobre drywall, desde a instalação até dicas de manutenção.', 1, true),
    ('steel-frame', 'Steel Frame', 'Tudo sobre steel frame, desde a instalação até dicas de manutenção.', 2, true),
    ('acustica', 'Acústica', 'Soluções e técnicas de isolamento acústico.', 3, true),
    ('forros', 'Forros', 'Tipos de forros e instalação.', 4, true)
ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- SETUP COMPLETO!
-- ========================================
-- Agora você pode usar o painel admin em /admin
