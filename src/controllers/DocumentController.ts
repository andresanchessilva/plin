import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { DocumentService } from "../services/DocumentService";

export class DocumentController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const result = await DocumentService.getAll(page, limit, search);
    res.json({
      success: true,
      ...result,
    });
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await DocumentService.getById(id);
    res.json({
      success: true,
      ...result,
    });
  });

  static getByClient = asyncHandler(async (req: Request, res: Response) => {
    const { clientId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const result = await DocumentService.getByClient(
      clientId,
      page,
      limit,
      search
    );
    res.json({
      success: true,
      ...result,
    });
  });

  static getByUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const result = await DocumentService.getByUser(userId, page, limit, search);
    res.json({
      success: true,
      ...result,
    });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const { titulo, conteudo, client_id, data_processamento } = req.body;
    const uploaded_by = req.user?.id;
    const result = await DocumentService.create({
      titulo,
      conteudo,
      client_id,
      uploaded_by,
      data_processamento,
    });
    res.status(201).json({
      success: true,
      ...result,
    });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { titulo, conteudo, data_processamento } = req.body;
    const result = await DocumentService.update(id, {
      titulo,
      conteudo,
      data_processamento,
    });
    res.json({
      success: true,
      ...result,
    });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await DocumentService.delete(id);
    res.json({
      success: true,
      ...result,
    });
  });
}
