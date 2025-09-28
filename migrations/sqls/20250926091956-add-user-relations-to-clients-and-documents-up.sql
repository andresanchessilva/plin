-- Adicionar coluna created_by na tabela clients
ALTER TABLE clients ADD COLUMN created_by INTEGER;

-- Adicionar coluna uploaded_by na tabela documents
ALTER TABLE documents ADD COLUMN uploaded_by INTEGER;

-- Adicionar foreign keys
ALTER TABLE clients ADD CONSTRAINT fk_clients_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE documents ADD CONSTRAINT fk_documents_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Adicionar índices
CREATE INDEX idx_clients_created_by ON clients(created_by);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
