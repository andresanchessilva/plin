-- Remover índices
DROP INDEX IF EXISTS idx_documents_uploaded_by;
DROP INDEX IF EXISTS idx_clients_created_by;

-- Remover foreign keys
ALTER TABLE documents DROP CONSTRAINT IF EXISTS fk_documents_uploaded_by;
ALTER TABLE clients DROP CONSTRAINT IF EXISTS fk_clients_created_by;

-- Remover colunas
ALTER TABLE documents DROP COLUMN IF EXISTS uploaded_by;
ALTER TABLE clients DROP COLUMN IF EXISTS created_by;
