# Plin - API Express + Sequelize + TypeScript

API RESTful para gerenciamento de clientes e documentos com upload de PDF e web scraping.

## 🚀 Instruções para Execução

### Pré-requisitos

- Node.js 16+
- Docker e Docker Compose
- npm

### Instalação e Execução

1. **Clone e instale dependências**

```bash
git clone <url-do-repositorio>
cd plin
npm install
```

2. **Configure variáveis de ambiente**

```bash
cp env.example .env
```

3. **Inicie o banco de dados**

```bash
docker-compose up -d
```

4. **Execute migrações (inclui dados de teste)**

```bash
npm run migrate:up
```

5. **Inicie o servidor**

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000`

## 📡 Endpoints Principais

### Autenticação

- `POST /api/users/login` - Login
- `POST /api/users/refresh-token` - Renovar token

### Clientes

- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Criar cliente
- `GET /api/clients/:id` - Buscar cliente
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Deletar cliente

### Documentos

- `GET /api/documents` - Listar documentos
- `GET /api/documents/client/:clientId` - Documentos por cliente
- `GET /api/documents/user/:userId` - Documentos por usuário
- `POST /api/documents` - Criar documento
- `PUT /api/documents/:id` - Atualizar documento
- `DELETE /api/documents/:id` - Deletar documento

### Upload e Web Scraping

- `POST /api/upload/pdf` - Upload de PDF
- `POST /api/web/scrape` - Extrair conteúdo de página web

### Health Check

- `GET /health` - Status da API

## 🧪 Dados de Teste

Após executar as migrações, você terá:

**Usuário de teste:**

- Email: `test@plin.com`
- Senha: `test123`

**Dados incluídos:**

- 3 clientes de exemplo
- 6 documentos de exemplo (3 PDFs e 3 URLs)
- **Metadata**: Cada documento inclui metadados específicos do tipo
  - **PDFs**: número de páginas, autor, data de criação
  - **URLs**: URL original, tamanho do conteúdo, número de imagens

## 📝 Exemplos de Requisições

### 1. Login

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@plin.com", "password": "test123"}'
```

### 2. Listar Clientes

```bash
curl -X GET http://localhost:3000/api/clients \
  -H "Authorization: Bearer <seu-token>"
```

### 3. Criar Cliente

```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu-token>" \
  -d '{"nome": "João Silva", "email": "joao@example.com"}'
```

### 4. Upload de PDF

```bash
curl -X POST http://localhost:3000/api/upload/pdf \
  -H "Authorization: Bearer <seu-token>" \
  -F "pdf=@/caminho/para/arquivo.pdf" \
  -F "client_id=1"
```

> **Testado com Insomnia**: Esta rota foi testada usando Insomnia com sucesso, enviando um arquivo PDF real através da propriedade `pdf` e o `client_id` correspondente. O upload funcionou corretamente e o conteúdo foi extraído e salvo no banco de dados.

### 5. Web Scraping

```bash
curl -X POST http://localhost:3000/api/web/scrape \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu-token>" \
  -d '{"url": "https://example.com", "client_id": 1}'
```

### 6. Listar Documentos

```bash
curl -X GET http://localhost:3000/api/documents \
  -H "Authorization: Bearer <seu-token>"
```

### 7. Documentos por Usuário

```bash
curl -X GET http://localhost:3000/api/documents/user/1 \
  -H "Authorization: Bearer <seu-token>"
```

## 🔧 Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev          # Desenvolvimento com hot reload
npm run build        # Compilar TypeScript
npm start           # Produção
npm run migrate:up   # Executar migrações
npm run migrate:down # Reverter migrações
```

### Testes

```bash
npm test                    # Executar todos os testes
npm run test:watch         # Executar testes em modo watch
npm run test:coverage      # Executar testes com cobertura
npm run test:unit          # Executar apenas testes unitários
npm run test:integration   # Executar apenas testes de integração
npm run test:real          # Executar testes reais (com banco de dados)
```

### Setup de Banco de Testes

```bash
npm run test:setup         # Configurar banco de testes (primeira vez)
npm run test:reset         # Resetar banco de testes
npm run test:cleanup       # Limpar banco de testes
```

## 🧪 Configuração e Execução de Testes

### Setup Inicial dos Testes

1. **Iniciar containers Docker**

```bash
docker-compose up -d
```

2. **Configurar banco de testes (primeira vez)**

```bash
npm run test:setup
```

-

3. **Executar testes**

```bash
npm test
```

### Tipos de Testes

#### Testes Unitários (Com Mocks)

- **Localização**: `tests/unit/`
- **Características**: Usam mocks, executam rapidamente
- **Exemplos**: `PDFExtractionService.test.ts`, `WebScrapingService.test.ts`

#### Testes de Integração

- **Localização**: `tests/integration/`
- **Características**: Testam fluxos completos com API
- **Exemplos**: `webRoutes.test.ts`, `full-workflow.test.ts`

#### Testes Reais (Sem Mocks)

- **Localização**: `tests/unit/services/*.real.test.ts`
- **Características**: Usam banco de dados real, testam services completos
- **Exemplos**: `DocumentService.real.test.ts`, `UserService.real.test.ts`

### Banco de Dados dos Testes

- **Banco de Desenvolvimento**: `plin_db` (porta 3000)
- **Banco de Testes**: `plin_test_db` (porta 3001)
- **Isolamento**: Completamente separados, dados seguros
- **Limpeza**: Automática entre testes

### Comandos Úteis para Testes

```bash
# Executar apenas testes reais
npm run test:real

# Resetar banco de testes se houver problemas
npm run test:reset

# Executar testes com logs detalhados
npm test -- --verbose

# Executar teste específico
npm test -- --testNamePattern="should create a document"

# Executar testes de um arquivo específico
npm test -- --testPathPatterns="DocumentService.real.test.ts"
```

### ⚠️ Importante: Reset do Banco de Testes

**Os testes reais precisam de um banco limpo para funcionar corretamente.**

```bash
# SEMPRE execute antes de rodar os testes
npm run test:reset

# Depois execute os testes
npm test
```

## 🐳 Docker

### Banco de dados

```bash
docker-compose up -d    # Iniciar PostgreSQL + pgAdmin
docker-compose down     # Parar containers
```

## 📋 Observações Importantes

- **Autenticação**: Todas as rotas (exceto login e health) requerem token JWT
- **Soft Delete**: Registros são marcados como deletados, não removidos fisicamente
- **Paginação**: Listagens suportam parâmetros `page` e `limit`
- **Upload**: PDFs são processados e conteúdo extraído automaticamente
- **Web Scraping**: Extrai título, conteúdo e metadados de páginas web
- **Validação**: Dados são validados antes de serem salvos
- **Logs**: Erros são logados no console

## 👨‍💻 Autor

**André Gustavo**
