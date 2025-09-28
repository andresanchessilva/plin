#!/bin/bash

# Script para configurar banco de teste automaticamente
# Este script pode ser executado por qualquer pessoa

echo "🔧 Configurando banco de teste..."

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

# Executar migrações no banco de teste
echo "🚀 Executando migrações no banco de teste..."
NODE_ENV=test npx db-migrate up --force-exit

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
