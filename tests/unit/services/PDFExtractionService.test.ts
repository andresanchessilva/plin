import { PDFExtractionService } from "../../../src/services/PDFExtractionService";
import pdf from "pdf-parse";
import fs from "fs";

// Mock do pdf-parse
jest.mock("pdf-parse");
const mockedPdf = pdf as jest.MockedFunction<typeof pdf>;

// Mock do fs
jest.mock("fs");
const mockedFs = fs as jest.Mocked<typeof fs>;

describe("PDFExtractionService - Simple Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("extractFromFile", () => {
    it("should extract PDF data successfully", async () => {
      // Arrange
      const filePath = "/path/to/test.pdf";
      const mockPdfData = {
        text: "This is the extracted text content from the PDF.",
        numpages: 2,
        info: {
          Title: "Test PDF Document",
          Author: "Test Author",
        },
        version: "1.4",
      } as any; // Usar any para evitar problemas de tipos

      const mockBuffer = Buffer.from("mock pdf content");
      mockedFs.readFileSync.mockReturnValueOnce(mockBuffer);
      mockedPdf.mockResolvedValueOnce(mockPdfData);

      // Act
      const result = await PDFExtractionService.extractFromFile(filePath);

      // Assert
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(filePath);
      expect(mockedPdf).toHaveBeenCalledWith(mockBuffer);
      expect(result).toEqual({
        titulo: "Test PDF Document",
        conteudo: "This is the extracted text content from the PDF.",
        data_processamento: expect.any(Date),
        metadata: {
          pages: 2,
          info: {
            Title: "Test PDF Document",
            Author: "Test Author",
          },
          version: "1.4",
        },
      });
    });

    it("should handle PDF without title", async () => {
      // Arrange
      const filePath = "/path/to/test.pdf";
      const mockPdfData = {
        text: "This is the extracted text content from the PDF.",
        numpages: 1,
        info: {
          Author: "Test Author",
        },
        version: "1.4",
      } as any;

      const mockBuffer = Buffer.from("mock pdf content");
      mockedFs.readFileSync.mockReturnValueOnce(mockBuffer);
      mockedPdf.mockResolvedValueOnce(mockPdfData);

      // Act
      const result = await PDFExtractionService.extractFromFile(filePath);

      // Assert
      expect(result.titulo).toBeUndefined();
      expect(result.conteudo).toBe(
        "This is the extracted text content from the PDF."
      );
      expect(result.metadata?.pages).toBe(1);
    });

    it("should handle file read error", async () => {
      // Arrange
      const filePath = "/path/to/nonexistent.pdf";
      const readError = new Error("ENOENT: no such file or directory");
      mockedFs.readFileSync.mockImplementationOnce(() => {
        throw readError;
      });

      // Act & Assert
      await expect(
        PDFExtractionService.extractFromFile(filePath)
      ).rejects.toThrow(
        "Erro ao extrair dados do PDF: ENOENT: no such file or directory"
      );
    });

    it("should handle PDF parsing error", async () => {
      // Arrange
      const filePath = "/path/to/corrupted.pdf";
      const mockBuffer = Buffer.from("corrupted pdf content");
      const parseError = new Error("Invalid PDF format");

      mockedFs.readFileSync.mockReturnValueOnce(mockBuffer);
      mockedPdf.mockRejectedValueOnce(parseError);

      // Act & Assert
      await expect(
        PDFExtractionService.extractFromFile(filePath)
      ).rejects.toThrow("Erro ao extrair dados do PDF: Invalid PDF format");
    });

    it("should set correct processing date", async () => {
      // Arrange
      const filePath = "/path/to/test.pdf";
      const mockPdfData = {
        text: "Test content",
        numpages: 1,
        info: { Title: "Test" },
        version: "1.4",
      } as any;

      const mockBuffer = Buffer.from("mock pdf content");
      mockedFs.readFileSync.mockReturnValueOnce(mockBuffer);
      mockedPdf.mockResolvedValueOnce(mockPdfData);

      const beforeExtraction = new Date();

      // Act
      const result = await PDFExtractionService.extractFromFile(filePath);

      const afterExtraction = new Date();

      // Assert
      expect(result.data_processamento).toBeInstanceOf(Date);
      expect(result.data_processamento.getTime()).toBeGreaterThanOrEqual(
        beforeExtraction.getTime()
      );
      expect(result.data_processamento.getTime()).toBeLessThanOrEqual(
        afterExtraction.getTime()
      );
    });
  });
});
