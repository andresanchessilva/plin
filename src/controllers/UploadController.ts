import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { PDFExtractionService } from "../services/PDFExtractionService";
import { DocumentService } from "../services/DocumentService";
import { AppError } from "../middleware/errorHandler";

export class UploadController {
  static uploadPDF = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("Nenhum arquivo PDF foi enviado", 400);
    }

    const { client_id } = req.body;
    if (!client_id) {
      throw new AppError("client_id é obrigatório", 400);
    }

    try {
      const extractedData = await PDFExtractionService.extractFromFile(
        req.file.path
      );

      const documentData = {
        titulo: extractedData.metadata?.info.Title,
        conteudo: extractedData.conteudo,
        client_id: parseInt(client_id),
        uploaded_by: req.user?.id,
        data_processamento: extractedData.data_processamento,
        type: "pdf" as const,
        meta_data: extractedData.metadata,
      };

      const result = await DocumentService.create(documentData);

      res.status(201).json({
        success: true,
        data: result.data,
        message: "PDF processado e documento criado com sucesso",
        metadata: {
          arquivo: req.file.originalname,
          tamanho: req.file.size,
          ...extractedData.metadata,
        },
      });
    } catch (error) {
      throw new AppError(
        `Erro ao processar PDF: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
        500
      );
    }
  });
}
