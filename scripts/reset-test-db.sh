#!/bin/bash

# Script para resetar completamente o banco de teste
echo "🔄 Resetando banco de teste..."

# Verificar se o Docker está rodando
if ! docker ps | grep -q plin_postgres; then
    echo "❌ Container PostgreSQL não está rodando. Execute: docker-compose up -d"
    exit 1
fi

# Deletar banco de teste
echo "🗑️  Removendo banco de teste..."
docker exec plin_postgres psql -U plin_user -d plin_db -c "DROP DATABASE IF EXISTS plin_test_db;" 2>/dev/null || true

# Criar banco de teste
echo "📦 Criando banco de teste..."
docker exec plin_postgres psql -U plin_user -d plin_db -c "CREATE DATABASE plin_test_db;"

# Executar migrações SQL diretamente
echo "🚀 Executando migrações SQL..."

# 1. Criar tabela clients
docker exec -i plin_postgres psql -U plin_user -d plin_test_db < migrations/sqls/20250926043624-create-clients-table-up.sql

# 2. Criar tabela documents
docker exec -i plin_postgres psql -U plin_user -d plin_test_db < migrations/sqls/20250926043633-create-documents-table-up.sql

# 3. Criar tabela users
docker exec -i plin_postgres psql -U plin_user -d plin_test_db < migrations/sqls/20250926091943-create-users-table-up.sql

# 4. Adicionar relações
docker exec plin_postgres psql -U plin_user -d plin_test_db -c "
ALTER TABLE clients ADD COLUMN created_by INTEGER REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN uploaded_by INTEGER REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
"

# 5. Adicionar colunas type e meta_data
docker exec plin_postgres psql -U plin_user -d plin_test_db -c "
ALTER TABLE documents
ADD COLUMN type VARCHAR(10) NOT NULL DEFAULT 'pdf' CHECK (type IN ('pdf', 'url')),
ADD COLUMN meta_data JSONB;
"

echo "✅ Banco de teste resetado com sucesso!"
