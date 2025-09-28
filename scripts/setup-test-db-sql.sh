#!/bin/bash

# Script para configurar banco de teste usando SQL direto
echo "🔧 Configurando banco de teste com SQL direto..."

# Verificar se o Docker está rodando
if ! docker ps | grep -q plin_postgres; then
    echo "❌ Container PostgreSQL não está rodando. Execute: docker-compose up -d"
    exit 1
fi

# Deletar banco de teste se existir
echo "🗑️  Removendo banco de teste existente..."
docker exec plin_postgres psql -U plin_user -d plin_db -c "DROP DATABASE IF EXISTS plin_test_db;" 2>/dev/null || true

# Criar banco de teste
echo "📦 Criando banco de teste..."
docker exec plin_postgres psql -U plin_user -d plin_db -c "CREATE DATABASE plin_test_db;"

# Executar migrações SQL diretamente
echo "🚀 Executando migrações SQL..."

# 1. Criar tabela clients
echo "  📋 Criando tabela clients..."
docker exec -i plin_postgres psql -U plin_user -d plin_test_db < migrations/sqls/20250926043624-create-clients-table-up.sql

# 2. Criar tabela documents
echo "  📋 Criando tabela documents..."
docker exec -i plin_postgres psql -U plin_user -d plin_test_db < migrations/sqls/20250926043633-create-documents-table-up.sql

# 3. Criar tabela users
echo "  📋 Criando tabela users..."
docker exec -i plin_postgres psql -U plin_user -d plin_test_db < migrations/sqls/20250926091943-create-users-table-up.sql

# 4. Adicionar relações
echo "  🔗 Adicionando relações..."
docker exec plin_postgres psql -U plin_user -d plin_test_db -c "
ALTER TABLE clients ADD COLUMN created_by INTEGER REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN uploaded_by INTEGER REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
"

# 5. Adicionar colunas type e meta_data
echo "  📊 Adicionando colunas type e meta_data..."
docker exec plin_postgres psql -U plin_user -d plin_test_db -c "
ALTER TABLE documents
ADD COLUMN type VARCHAR(10) NOT NULL DEFAULT 'pdf' CHECK (type IN ('pdf', 'url')),
ADD COLUMN meta_data JSONB;
"

# Verificar se as tabelas foram criadas
echo "✅ Verificando se as tabelas foram criadas..."
TABLES=$(docker exec plin_postgres psql -U plin_user -d plin_test_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')

if [ "$TABLES" -gt 0 ]; then
    echo "🎉 Banco de teste configurado com sucesso!"
    echo "📊 Tabelas criadas: $TABLES"
    echo ""
    echo "Para executar os testes:"
    echo "  npm test"
    echo ""
    echo "Para limpar o banco de teste:"
    echo "  ./scripts/cleanup-test-db.sh"
else
    echo "❌ Erro: Nenhuma tabela foi criada no banco de teste"
    exit 1
fi
