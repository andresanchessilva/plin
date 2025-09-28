import { Client } from "../models";
import { AppError } from "../middleware/errorHandler";
import { col, fn, Op } from "sequelize";

export class ClientService {
  static async getAll(page = 1, limit = 10, search?: string) {
    const offset = (page - 1) * limit;
    const whereClause: any = {};

    if (search) {
      whereClause[Op.or] = [
        { nome: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const clients = await Client.findAll({
      where: whereClause,
      attributes: {
        include: [[fn("COUNT", col("documents.id")), "documentsCount"]],
      },
      include: [
        {
          association: "documents",
          attributes: [],
          required: false,
        },
      ],
      group: ["Client.id"],
      limit,
      offset,
      order: [["created_at", "DESC"]],
      subQuery: false,
    });

    const total = await Client.count({ where: whereClause });

    return {
      data: clients.map((c) => ({
        ...c.get(),
        documentsCount: Number(c.get("documentsCount") || 0),
      })),
      count: clients.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
  static async getById(id: string | number) {
    const client = await Client.findOne({
      where: { id },
      attributes: {
        include: [[fn("COUNT", col("documents.id")), "documentsCount"]],
      },
      include: [
        {
          association: "documents",
          attributes: [],
          required: false,
        },
      ],
      group: ["Client.id"],
    });

    if (!client) {
      throw new AppError("Cliente não encontrado", 404);
    }

    return {
      data: {
        ...client.get(),
        documentsCount: Number(client.get("documentsCount") || 0),
      },
    };
  }

  static async create(clientData: {
    nome: string;
    email: string;
    created_by?: number;
  }) {
    const { nome, email, created_by } = clientData;

    if (!nome || !email) {
      throw new AppError("Nome e email são obrigatórios", 400);
    }

    const existingClient = await Client.findOne({ where: { email } });
    if (existingClient) {
      throw new AppError("Email já está em uso", 409);
    }

    const client = await Client.create({
      nome,
      email,
      created_by,
    });

    return {
      data: client,
      message: "Cliente criado com sucesso",
    };
  }

  static async update(
    id: string | number,
    updateData: { nome?: string; email?: string }
  ) {
    const { nome, email } = updateData;

    const client = await Client.findByPk(id);
    if (!client) {
      throw new AppError("Cliente não encontrado", 404);
    }

    if (email && email !== client.email) {
      const existingClient = await Client.findOne({
        where: {
          email,
          id: { [require("sequelize").Op.ne]: id },
        },
      });
      if (existingClient) {
        throw new AppError("Email já está em uso por outro cliente", 409);
      }
    }

    await client.update({ nome, email });

    return {
      data: client,
      message: "Cliente atualizado com sucesso",
    };
  }

  static async delete(id: string | number) {
    const client = await Client.findByPk(id);
    if (!client) {
      throw new AppError("Cliente não encontrado", 404);
    }

    await client.destroy();

    return {
      message: "Cliente deletado com sucesso",
    };
  }
}
