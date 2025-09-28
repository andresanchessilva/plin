import request from "supertest";
import app from "../../src/index";
import { WebScrapingService } from "../../src/services/WebScrapingService";
import { DocumentService } from "../../src/services/DocumentService";

// Mock dos serviços
jest.mock("../../src/services/WebScrapingService");
jest.mock("../../src/services/DocumentService");

// Mock do middleware de autenticação
jest.mock("../../src/middleware/auth", () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { id: 1, email: "test@example.com", role: "USER" };
    next();
  },
}));

const mockedWebScrapingService = WebScrapingService as jest.Mocked<
  typeof WebScrapingService
>;
const mockedDocumentService = DocumentService as jest.Mocked<
  typeof DocumentService
>;

describe("Web Routes Integration Tests - Simple", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/web/scrape", () => {
    it("should scrape and save document successfully", async () => {
      // Arrange
      const requestBody = {
        url: "https://example.com/test-article",
        client_id: 1,
      };

      const mockScrapingData = {
        titulo: "Test Article Title",
        conteudo: "Test content",
        data_processamento: new Date(),
        metadata: {
          url: "https://example.com/test-article",
          contentLength: 100,
        },
      };

      const mockDocumentResult = {
        data: {} as any, // Simplified for testing
        message: "Documento criado com sucesso",
      };

      mockedWebScrapingService.extractFromUrl.mockResolvedValueOnce(
        mockScrapingData
      );
      mockedDocumentService.create.mockResolvedValueOnce(mockDocumentResult);

      // Act
      const response = await request(app)
        .post("/api/web/scrape")
        .set("Authorization", "Bearer mock-token")
        .send(requestBody);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Página web processada e documento criado com sucesso"
      );
    });

    it("should return 400 when URL is missing", async () => {
      // Arrange
      const requestBody = {
        client_id: 1,
      };

      // Act
      const response = await request(app)
        .post("/api/web/scrape")
        .set("Authorization", "Bearer mock-token")
        .send(requestBody);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("URL é obrigatória");
    });

    it("should return 400 when client_id is missing", async () => {
      // Arrange
      const requestBody = {
        url: "https://example.com/test-article",
      };

      // Act
      const response = await request(app)
        .post("/api/web/scrape")
        .set("Authorization", "Bearer mock-token")
        .send(requestBody);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("client_id é obrigatório");
    });

    it("should return 500 when WebScrapingService fails", async () => {
      // Arrange
      const requestBody = {
        url: "https://example.com/invalid",
        client_id: 1,
      };

      mockedWebScrapingService.extractFromUrl.mockRejectedValueOnce(
        new Error("Page not found")
      );

      // Act
      const response = await request(app)
        .post("/api/web/scrape")
        .set("Authorization", "Bearer mock-token")
        .send(requestBody);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Erro ao processar página web");
    });
  });
});
