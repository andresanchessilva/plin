import { Document, Client } from "../models";
import { AppError } from "../middleware/errorHandler";

export class DocumentService {
  static async getAll(page: number = 1, limit: number = 10, search?: string) {
    const offset = (page - 1) * limit;
    const whereClause: any = {};

    if (search) {
      whereClause[require("sequelize").Op.or] = [
        { titulo: { [require("sequelize").Op.iLike]: `%${search}%` } },
        { conteudo: { [require("sequelize").Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Document.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Client,
          as: "client",
          required: true,
        },
      ],
      limit,
      offset,
      order: [["data_processamento", "DESC"]],
      distinct: true,
    });

    return {
      data: rows,
      count: rows.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  }

  static async getById(id: string | number) {
    const document = await Document.findByPk(id, {
      include: [
        {
          model: Client,
          as: "client",
          required: true,
        },
      ],
    });

    if (!document) {
      throw new AppError("Documento não encontrado", 404);
    }

    return { data: document };
  }

  static async getByClient(
    clientId: string | number,
    page: number = 1,
    limit: number = 10,
    search?: string
  ) {
    const client = await Client.findByPk(clientId);
    if (!client) {
      throw new AppError("Cliente não encontrado", 404);
    }

    const offset = (page - 1) * limit;
    const whereClause: any = { client_id: clientId };

    if (search) {
      whereClause[require("sequelize").Op.or] = [
        { titulo: { [require("sequelize").Op.iLike]: `%${search}%` } },
        { conteudo: { [require("sequelize").Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Document.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Client,
          as: "client",
          required: true,
        },
      ],
      limit,
      offset,
      order: [["data_processamento", "DESC"]],
      distinct: true,
    });

    return {
      data: rows,
      count: rows.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  }

  static async getByUser(
    userId: string | number,
    page: number = 1,
    limit: number = 10,
    search?: string
  ) {
    const offset = (page - 1) * limit;
    const whereClause: any = { uploaded_by: userId };

    if (search) {
      whereClause[require("sequelize").Op.or] = [
        { titulo: { [require("sequelize").Op.iLike]: `%${search}%` } },
        { conteudo: { [require("sequelize").Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Document.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Client,
          as: "client",
          required: true,
        },
      ],
      limit,
      offset,
      order: [["data_processamento", "DESC"]],
      distinct: true,
    });

    return {
      data: rows,
      count: rows.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  }

  static async create(documentData: {
    titulo: string;
    conteudo: string;
    client_id: number;
    uploaded_by?: number;
    data_processamento?: Date;
    type?: "pdf" | "url";
    meta_data?: any;
  }) {
    const {
      titulo,
      conteudo,
      client_id,
      uploaded_by,
      data_processamento,
      type,
      meta_data,
    } = documentData;

    if (!titulo || !conteudo || !client_id) {
      throw new AppError("Título, conteúdo e client_id são obrigatórios", 400);
    }

    const client = await Client.findByPk(client_id);
    if (!client) {
      throw new AppError("Cliente não encontrado", 404);
    }

    const document = await Document.create({
      titulo,
      conteudo,
      client_id,
      uploaded_by,
      data_processamento: data_processamento || new Date(),
      type: type || "pdf",
      meta_data,
    });

    const createdDocument = await Document.findByPk(document.id, {
      include: [
        {
          model: Client,
          as: "client",
          required: true,
        },
      ],
    });

    return {
      data: createdDocument,
      message: "Documento criado com sucesso",
    };
  }

  static async update(
    id: string | number,
    updateData: {
      titulo?: string;
      conteudo?: string;
      data_processamento?: Date;
    }
  ) {
    const { titulo, conteudo, data_processamento } = updateData;

    const document = await Document.findByPk(id);
    if (!document) {
      throw new AppError("Documento não encontrado", 404);
    }

    await document.update({
      titulo,
      conteudo,
      data_processamento,
    });

    const updatedDocument = await Document.findByPk(id, {
      include: [
        {
          model: Client,
          as: "client",
          required: true,
        },
      ],
    });

    return {
      data: updatedDocument,
      message: "Documento atualizado com sucesso",
    };
  }

  static async delete(id: string | number) {
    const document = await Document.findByPk(id);
    if (!document) {
      throw new AppError("Documento não encontrado", 404);
    }

    await document.destroy();

    return {
      message: "Documento deletado com sucesso",
    };
  }
}
