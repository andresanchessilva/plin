import { Request, Response } from "express";
import {
  UserService,
  CreateUserData,
  UpdateUserData,
  LoginData,
} from "../services/UserService";
import { JWTService } from "../services/JWTService";
import { UserRole } from "../models/User";

export class UserController {
  /**
   * Cria um novo usuário
   */
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email e senha são obrigatórios",
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: "A senha deve ter pelo menos 6 caracteres",
        });
        return;
      }

      const userData: CreateUserData = {
        email,
        password,
        role: role || UserRole.USER,
      };

      const user = await UserService.createUser(userData);

      res.status(201).json({
        success: true,
        message: "Usuário criado com sucesso",
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  }

  /**
   * Lista todos os usuários
   */
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await UserService.getAllUsers(page, limit, search);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  /**
   * Busca um usuário por ID
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "ID inválido",
        });
        return;
      }

      const user = await UserService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  /**
   * Atualiza um usuário
   */
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "ID inválido",
        });
        return;
      }

      const { email, password, role } = req.body;

      if (password && password.length < 6) {
        res.status(400).json({
          success: false,
          message: "A senha deve ter pelo menos 6 caracteres",
        });
        return;
      }

      const updateData: UpdateUserData = {};
      if (email) updateData.email = email;
      if (password) updateData.password = password;
      if (role) updateData.role = role;

      const user = await UserService.updateUser(userId, updateData);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
        });
        return;
      }

      res.json({
        success: true,
        message: "Usuário atualizado com sucesso",
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  }

  /**
   * Remove um usuário
   */
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "ID inválido",
        });
        return;
      }

      const deleted = await UserService.deleteUser(userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
        });
        return;
      }

      res.json({
        success: true,
        message: "Usuário removido com sucesso",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  /**
   * Autentica um usuário (login)
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email e senha são obrigatórios",
        });
        return;
      }

      const loginData: LoginData = { email, password };
      const user = await UserService.authenticateUser(loginData);

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Credenciais inválidas",
        });
        return;
      }

      // Gerar tokens JWT
      const tokens = JWTService.generateTokenPair({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.json({
        success: true,
        message: "Login realizado com sucesso",
        data: {
          user,
          ...tokens,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  /**
   * Renova o token de acesso usando refresh token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: "Refresh token é obrigatório",
        });
        return;
      }

      // Verificar o refresh token
      const payload = JWTService.verifyToken(refreshToken);

      // Buscar o usuário para garantir que ainda existe
      const user = await UserService.getUserById(payload.id);
      if (!user) {
        res.status(401).json({
          success: false,
          message: "Usuário não encontrado",
        });
        return;
      }

      // Gerar novos tokens
      const tokens = JWTService.generateTokenPair({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.json({
        success: true,
        message: "Token renovado com sucesso",
        data: tokens,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : "Token inválido",
      });
    }
  }

  /**
   * Cria usuário admin padrão (para desenvolvimento)
   */
  static async createDefaultAdmin(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserService.createDefaultAdmin();

      res.status(201).json({
        success: true,
        message: "Usuário admin padrão criado com sucesso",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }
}
