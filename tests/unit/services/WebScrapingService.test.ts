import axios from "axios";
import { WebScrapingService } from "../../../src/services/WebScrapingService";

// Mock do axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("WebScrapingService - Simple Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("extractFromUrl", () => {
    it("should extract content from a valid URL successfully", async () => {
      // Arrange
      const url = "https://example.com/test-article";
      const mockHtml = `
        <html>
          <head>
            <title>Test Article Title</title>
            <meta name="description" content="Test description">
          </head>
          <body>
            <article>
              <h1>Test Article Title</h1>
              <p>This is the main content of the test article.</p>
            </article>
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValueOnce({
        data: mockHtml,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      // Act
      const result = await WebScrapingService.extractFromUrl(url);

      // Assert
      expect(result).toBeDefined();
      expect(result.titulo).toBe("Test Article Title");
      expect(result.conteudo).toContain(
        "This is the main content of the test article"
      );
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.url).toBe(url);
      expect(mockedAxios.get).toHaveBeenCalledWith(url, expect.any(Object));
    });

    it("should handle invalid URL", async () => {
      // Arrange
      const invalidUrl = "not-a-valid-url";

      // Act & Assert
      await expect(
        WebScrapingService.extractFromUrl(invalidUrl)
      ).rejects.toThrow("URL inválida fornecida");
    });

    it("should handle network error", async () => {
      // Arrange
      const url = "https://example.com/network-error";
      const networkError = new Error("Network Error");
      mockedAxios.get.mockRejectedValueOnce(networkError);

      // Act & Assert
      await expect(WebScrapingService.extractFromUrl(url)).rejects.toThrow(
        "Erro ao extrair dados da página: Network Error"
      );
    });

    it("should handle pages without title and use fallback", async () => {
      // Arrange
      const url = "https://example.com/no-title";
      const htmlWithoutTitle = `
        <html>
          <body>
            <h1>Main Heading</h1>
            <p>Content without title tag</p>
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValueOnce({
        data: htmlWithoutTitle,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      // Act
      const result = await WebScrapingService.extractFromUrl(url);

      // Assert
      expect(result.titulo).toBe("Main Heading");
      expect(result.conteudo).toContain("Content without title tag");
    });
  });
});
