CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    data_processamento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    client_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT fk_documents_client_id FOREIGN KEY (client_id) REFERENCES clients(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX idx_documents_client_id ON documents(client_id);

CREATE INDEX idx_documents_data_processamento ON documents(data_processamento);

CREATE INDEX idx_documents_deleted_at ON documents(deleted_at);