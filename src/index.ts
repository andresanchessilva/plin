import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { syncModels } from "./models";
import clientRoutes from "./routes/clientRoutes";
import documentRoutes from "./routes/documentRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import userRoutes from "./routes/userRoutes";
import webRoutes from "./routes/webRoutes";
import { errorHandler, notFound } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api/clients", clientRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/web", webRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "API Plin - Express + Sequelize + TypeScript",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      clients: "/api/clients",
      documents: "/api/documents",
      upload: "/api/upload",
      users: "/api/users",
      web: "/api/web",
    },
    testData: {
      user: {
        email: "test@plin.com",
        password: "test123",
        role: "USER",
        description: "Usuário de teste com acesso completo",
      },
      note: "Execute 'npm run migrate:up' para criar dados de teste (usuário, clientes e documentos)",
    },
    authentication: {
      login: "POST /api/users/login",
      refresh: "POST /api/users/refresh-token",
      header: "Authorization: Bearer <token>",
    },
  });
});

app.use("*", notFound);

app.use(errorHandler);

const startServer = async () => {
  try {
    await syncModels();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || "development"}`);
      console.log(`📋 Para dados de teste, execute: npm run migrate:up`);
    });
  } catch (error) {
    console.error("Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
};

// Only start the server if not in test environment
if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
