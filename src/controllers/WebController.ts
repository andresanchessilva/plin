import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { WebScrapingService } from "../services/WebScrapingService";
import { DocumentService } from "../services/DocumentService";
import { AppError } from "../middleware/errorHandler";

export class WebController {
  /**
   * Extrai conteúdo de uma página web e salva como documento
   */
  static scrapeAndSave = asyncHandler(async (req: Request, res: Response) => {
    const { url, client_id } = req.body;

    if (!url) {
      throw new AppError("URL é obrigatória", 400);
    }

    if (!client_id) {
      throw new AppError("client_id é obrigatório", 400);
    }

    try {
      const extractedData = await WebScrapingService.extractFromUrl(url);

      const documentData = {
        titulo: extractedData.titulo,
        conteudo: extractedData.conteudo,
        client_id: parseInt(client_id),
        uploaded_by: req.user?.id,
        data_processamento: extractedData.data_processamento,
        type: "url" as const,
        meta_data: extractedData.metadata,
      };

      const result = await DocumentService.create(documentData);

      res.status(201).json({
        success: true,
        data: result.data,
        message: "Página web processada e documento criado com sucesso",
        metadata: {
          url: extractedData.metadata?.url,
          contentLength: extractedData.metadata?.contentLength,
          images: extractedData.metadata?.images?.length || 0,
          links: extractedData.metadata?.links?.length || 0,
          ...extractedData.metadata,
        },
      });
    } catch (error) {
      throw new AppError(
        `Erro ao processar página web: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
        500
      );
    }
  });
}
