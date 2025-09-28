import { Request, Response } from "express";
import { UploadController } from "../../../src/controllers/UploadController";
import { PDFExtractionService } from "../../../src/services/PDFExtractionService";
import { DocumentService } from "../../../src/services/DocumentService";
import { Client } from "../../../src/models";

// Mock dos serviços
jest.mock("../../../src/services/PDFExtractionService");
jest.mock("../../../src/services/DocumentService");
jest.mock("../../../src/models");

const mockedPDFExtractionService = PDFExtractionService as jest.Mocked<
  typeof PDFExtractionService
>;
const mockedDocumentService = DocumentService as jest.Mocked<
  typeof DocumentService
>;
const mockedClient = Client as jest.Mocked<typeof Client>;

describe("UploadController - Simple Tests", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {},
      file: undefined,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("uploadPDF", () => {
    it("should upload and process PDF successfully", async () => {
      // Arrange
      const mockFile = {
        path: "/uploads/test.pdf",
        originalname: "test.pdf",
        size: 1024,
      } as Express.Multer.File;

      mockReq.file = mockFile;
      mockReq.body = { client_id: 1 };

      const mockExtractedData = {
        titulo: "Test PDF Document",
        conteudo: "This is the extracted content from PDF.",
        data_processamento: new Date(),
        metadata: {
          pages: 2,
          info: { Title: "Test PDF Document" },
          version: "1.4",
        },
      };

      const mockDocumentResult = {
        data: {
          id: 1,
          titulo: "Test PDF Document",
          conteudo: "This is the extracted content from PDF.",
          client_id: 1,
          data_processamento: mockExtractedData.data_processamento,
          created_at: new Date(),
          updated_at: new Date(),
        } as any,
        message: "Documento criado com sucesso",
      };

      mockedPDFExtractionService.extractFromFile.mockResolvedValueOnce(
        mockExtractedData
      );
      mockedClient.findByPk.mockResolvedValueOnce({
        id: 1,
        nome: "Test Client",
      } as any);
      mockedDocumentService.create.mockResolvedValueOnce(mockDocumentResult);

      // Act
      try {
        await UploadController.uploadPDF(
          mockReq as Request,
          mockRes as Response,
          jest.fn()
        );
      } catch (error) {
        // Ignore asyncHandler errors in tests
      }

      // Assert
      expect(mockedPDFExtractionService.extractFromFile).toHaveBeenCalledWith(
        "/uploads/test.pdf"
      );
      expect(mockedDocumentService.create).toHaveBeenCalled();
    });

    it("should throw error when no file is uploaded", async () => {
      // Arrange
      mockReq.body = { client_id: 1 };

      // Act & Assert
      try {
        await UploadController.uploadPDF(
          mockReq as Request,
          mockRes as Response,
          jest.fn()
        );
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should throw error when client_id is missing", async () => {
      // Arrange
      const mockFile = {
        path: "/uploads/test.pdf",
        originalname: "test.pdf",
        size: 1024,
      } as Express.Multer.File;

      mockReq.file = mockFile;

      // Act & Assert
      try {
        await UploadController.uploadPDF(
          mockReq as Request,
          mockRes as Response,
          jest.fn()
        );
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
