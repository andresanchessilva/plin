#!/bin/bash

# Script para limpar banco de teste
echo "🧹 Limpando banco de teste..."

# Verificar se o Docker está rodando
if ! docker ps | grep -q plin_postgres; then
    echo "❌ Container PostgreSQL não está rodando"
    exit 1
fi

# Deletar banco de teste
echo "🗑️  Removendo banco de teste..."
docker exec plin_postgres psql -U plin_user -d plin_db -c "DROP DATABASE IF EXISTS plin_test_db;" 2>/dev/null || true

echo "✅ Banco de teste removido com sucesso!"
