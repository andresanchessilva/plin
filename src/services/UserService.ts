import { Op } from "sequelize";
import User, { UserRole } from "../models/User";
import { ValidationError } from "sequelize";

export interface CreateUserData {
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  role?: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  email: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export class UserService {
  /**
   * Cria um novo usuário
   */
  static async createUser(userData: CreateUserData): Promise<UserResponse> {
    try {
      const user = await User.create(userData);
      return this.formatUserResponse(user);
    } catch (error) {
      if (error instanceof ValidationError) {
        const errorMessages = error.errors.map((err) => err.message);
        throw new Error(`Dados inválidos: ${errorMessages.join(", ")}`);
      }
      if (error instanceof Error && error.message.includes("duplicate key")) {
        throw new Error("Email já está em uso");
      }
      throw error;
    }
  }

  /**
   * Busca um usuário por ID
   */
  static async getUserById(id: number): Promise<UserResponse | null> {
    const user = await User.findByPk(id);
    return user ? this.formatUserResponse(user) : null;
  }

  /**
   * Busca um usuário por email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  /**
   * Lista todos os usuários com paginação
   */
  static async getAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{
    users: UserResponse[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const offset = (page - 1) * limit;
    const whereClause: any = {};

    if (search) {
      whereClause.email = {
        [Op.iLike]: `%${search}%`,
      };
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    const users = rows.map((user) => this.formatUserResponse(user));

    return {
      users,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  }

  /**
   * Atualiza um usuário
   */
  static async updateUser(
    id: number,
    userData: UpdateUserData
  ): Promise<UserResponse | null> {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        return null;
      }

      await user.update(userData);
      return this.formatUserResponse(user);
    } catch (error) {
      if (error instanceof ValidationError) {
        const errorMessages = error.errors.map((err) => err.message);
        throw new Error(`Dados inválidos: ${errorMessages.join(", ")}`);
      }
      if (error instanceof Error && error.message.includes("duplicate key")) {
        throw new Error("Email já está em uso");
      }
      throw error;
    }
  }

  /**
   * Remove um usuário (soft delete)
   */
  static async deleteUser(id: number): Promise<boolean> {
    const user = await User.findByPk(id);
    if (!user) {
      return false;
    }

    await user.destroy();
    return true;
  }

  /**
   * Autentica um usuário
   */
  static async authenticateUser(
    loginData: LoginData
  ): Promise<UserResponse | null> {
    const user = await this.getUserByEmail(loginData.email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await user.checkPassword(loginData.password);
    if (!isPasswordValid) {
      return null;
    }

    return this.formatUserResponse(user);
  }

  /**
   * Verifica se um usuário é admin
   */
  static async isUserAdmin(userId: number): Promise<boolean> {
    const user = await User.findByPk(userId);
    return user ? user.isAdmin() : false;
  }

  /**
   * Cria um usuário admin padrão (para desenvolvimento)
   */
  static async createDefaultAdmin(): Promise<UserResponse> {
    const existingAdmin = await this.getUserByEmail("admin@plim.com");
    if (existingAdmin) {
      return this.formatUserResponse(existingAdmin);
    }

    return await this.createUser({
      email: "admin@plim.com",
      password: "admin123",
      role: UserRole.ADMIN,
    });
  }

  /**
   * Cria um usuário padrão (para desenvolvimento)
   */
  static async createDefaultUser(): Promise<UserResponse> {
    const existingUser = await this.getUserByEmail("user@plim.com");
    if (existingUser) {
      return this.formatUserResponse(existingUser);
    }

    return await this.createUser({
      email: "user@plim.com",
      password: "user123",
      role: UserRole.USER,
    });
  }

  /**
   * Inicializa usuários padrão (admin e user) se não existirem
   */
  static async initializeDefaultUsers(): Promise<{
    admin: UserResponse;
    user: UserResponse;
  }> {
    const admin = await this.createDefaultAdmin();
    const user = await this.createDefaultUser();

    return { admin, user };
  }

  /**
   * Formata a resposta do usuário (remove a senha)
   */
  private static formatUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
