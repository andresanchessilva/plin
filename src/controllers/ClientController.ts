import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { ClientService } from "../services/ClientService";

export class ClientController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const result = await ClientService.getAll(page, limit, search);
    res.json({
      success: true,
      ...result,
    });
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ClientService.getById(id);
    res.json({
      success: true,
      ...result,
    });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const { nome, email } = req.body;
    const created_by = req.user?.id;
    const result = await ClientService.create({ nome, email, created_by });
    res.status(201).json({
      success: true,
      ...result,
    });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nome, email } = req.body;
    const result = await ClientService.update(id, { nome, email });
    res.json({
      success: true,
      ...result,
    });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ClientService.delete(id);
    res.json({
      success: true,
      ...result,
    });
  });
}
