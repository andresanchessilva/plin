import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService";
import { JWTService } from "../services/JWTService";
import { UserRole } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: UserRole;
      };
    }
  }
}

/**
 * Middleware de autenticação JWT
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: "Token de autorização não fornecido",
      });
      return;
    }

    const token = JWTService.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Formato de token inválido. Use: Bearer <token>",
      });
      return;
    }

    const payload = JWTService.verifyToken(token);

    const user = await UserService.getUserById(payload.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Usuário não encontrado",
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }
};

/**
 * Middleware para verificar se o usuário é admin
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Usuário não autenticado",
    });
    return;
  }

  if (req.user.role !== UserRole.ADMIN) {
    res.status(403).json({
      success: false,
      message:
        "Acesso negado. Apenas administradores podem acessar este recurso",
    });
    return;
  }

  next();
};

/**
 * Middleware opcional de autenticação
 * Não retorna erro se não houver token, apenas adiciona o usuário se existir
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = JWTService.extractTokenFromHeader(authHeader);

      if (token) {
        try {
          const payload = JWTService.verifyToken(token);
          const user = await UserService.getUserById(payload.id);

          if (user) {
            req.user = {
              id: user.id,
              email: user.email,
              role: user.role,
            };
          }
        } catch (error) {
          // Ignora erros de token na autenticação opcional
        }
      }
    }

    next();
  } catch (error) {
    next();
  }
};
