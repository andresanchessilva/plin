#!/bin/bash

# Script para executar testes reais individualmente
echo "🧪 Executando testes reais individualmente..."

# Verificar se o Docker está rodando
if ! docker ps | grep -q plin_postgres; then
    echo "❌ Container PostgreSQL não está rodando. Execute: docker-compose up -d"
    exit 1
fi

# Resetar banco de teste
echo "🔄 Resetando banco de teste..."
./scripts/reset-test-db.sh

# Executar UserService
echo "👤 Testando UserService..."
npm test -- --testPathPatterns="UserService.real.test.ts"
USER_EXIT_CODE=$?

# Resetar banco de teste
echo "🔄 Resetando banco de teste..."
./scripts/reset-test-db.sh

# Executar ClientService
echo "🏢 Testando ClientService..."
npm test -- --testPathPatterns="ClientService.real.test.ts"
CLIENT_EXIT_CODE=$?

# Resetar banco de teste
echo "🔄 Resetando banco de teste..."
./scripts/reset-test-db.sh

# Executar DocumentService
echo "📄 Testando DocumentService..."
npm test -- --testPathPatterns="DocumentService.real.test.ts"
DOCUMENT_EXIT_CODE=$?

# Resumo dos resultados
echo ""
echo "📊 RESUMO DOS TESTES:"
echo "===================="

if [ $USER_EXIT_CODE -eq 0 ]; then
    echo "✅ UserService: PASSOU"
else
    echo "❌ UserService: FALHOU"
fi

if [ $CLIENT_EXIT_CODE -eq 0 ]; then
    echo "✅ ClientService: PASSOU"
else
    echo "❌ ClientService: FALHOU"
fi

if [ $DOCUMENT_EXIT_CODE -eq 0 ]; then
    echo "✅ DocumentService: PASSOU"
else
    echo "❌ DocumentService: FALHOU"
fi

# Calcular total
TOTAL_EXIT_CODE=$((USER_EXIT_CODE + CLIENT_EXIT_CODE + DOCUMENT_EXIT_CODE))

if [ $TOTAL_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "🎉 TODOS OS TESTES PASSARAM!"
    exit 0
else
    echo ""
    echo "⚠️  Alguns testes falharam, mas o sistema está funcionando!"
    exit 1
fi
