-- Adiciona colunas para armazenar MDX bruto e HTML processado diretamente no Supabase
ALTER TABLE articles
    ADD COLUMN IF NOT EXISTS raw_mdx TEXT,
    ADD COLUMN IF NOT EXISTS processed_mdx TEXT;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'articles'
          AND column_name = 'content'
    ) THEN
        EXECUTE format(
            'UPDATE public.articles SET raw_mdx = COALESCE(raw_mdx, %I) WHERE %I IS NOT NULL',
            'content',
            'content'
        );
    END IF;
END $$;
