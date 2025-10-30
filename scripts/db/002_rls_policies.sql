-- Habilitar RLS (Row Level Security)
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

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
