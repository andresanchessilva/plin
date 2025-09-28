import { Request, Response, NextFunction } from "express";
import { ValidationError, DatabaseError } from "sequelize";

interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  errors?: any[];
}

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  if (err instanceof ValidationError) {
    const message = err.errors?.map((e: any) => e.message).join(", ");
    error = new AppError(message || "Validation Error", 400);
  }

  if (err instanceof DatabaseError) {
    const parentError = err.parent as any;
    if (parentError?.code === "23505") {
      error = new AppError("Duplicate entry", 409);
    } else if (parentError?.code === "23503") {
      error = new AppError("Foreign key constraint violation", 400);
    } else {
      error = new AppError("Database error", 500);
    }
  }

  if (err.name === "CastError") {
    error = new AppError("Invalid ID format", 400);
  }

  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid token", 401);
  }

  if (err.name === "TokenExpiredError") {
    error = new AppError("Token expired", 401);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      details: err,
    }),
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};
