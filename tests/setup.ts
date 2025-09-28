import dotenv from "dotenv";

// Carregar variáveis de ambiente para testes
dotenv.config({ path: ".env.test" });

// Configurar variáveis de ambiente padrão para testes
process.env.NODE_ENV = "test";
process.env.DB_HOST = process.env.DB_HOST || "localhost";
process.env.DB_PORT = process.env.DB_PORT || "5432";
process.env.DB_NAME = process.env.DB_NAME || "plin_test_db";
process.env.DB_USER = process.env.DB_USER || "plin_user";
process.env.DB_PASSWORD = process.env.DB_PASSWORD || "plin_password";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";
process.env.PORT = process.env.PORT || "3001";

// Configurar timeout global para testes
jest.setTimeout(10000);

// Mock do console.log para reduzir ruído nos testes
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
