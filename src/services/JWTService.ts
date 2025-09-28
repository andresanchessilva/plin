import jwt from "jsonwebtoken";
import { UserRole } from "../models/User";

export interface JWTPayload {
  id: number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export class JWTService {
  private static readonly JWT_SECRET: string =
    (process.env.JWT_SECRET as string) ||
    "plin-secret-key-change-in-production";
  private static readonly JWT_EXPIRES_IN: string =
    process.env.JWT_EXPIRES_IN || "24h";
  private static readonly JWT_REFRESH_EXPIRES_IN: string =
    process.env.JWT_REFRESH_EXPIRES_IN || "7d";

  /**
   * Gera um token JWT para o usuário
   */
  static generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  /**
   * Gera um refresh token para o usuário
   */
  static generateRefreshToken(
    payload: Omit<JWTPayload, "iat" | "exp">
  ): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  /**
   * Verifica e decodifica um token JWT
   */
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token expirado");
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Token inválido");
      } else {
        throw new Error("Erro ao verificar token");
      }
    }
  }

  /**
   * Decodifica um token sem verificar a assinatura (útil para debug)
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verifica se um token está expirado
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }
      return Date.now() >= decoded.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  /**
   * Extrai o token do header Authorization
   */
  static extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    return parts[1];
  }

  /**
   * Gera tokens de acesso e refresh
   */
  static generateTokenPair(payload: Omit<JWTPayload, "iat" | "exp">): {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  } {
    return {
      accessToken: this.generateToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      expiresIn: this.JWT_EXPIRES_IN,
    };
  }
}
