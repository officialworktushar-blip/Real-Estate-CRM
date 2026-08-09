import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export interface AppError extends Error {
  statusCode: number;
  code: string;
  details?: Record<string, string[]>;
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error(`[Error] ${statusCode}: ${message}`);

  res.status(statusCode).json({
    message,
    code: err.code || "INTERNAL_ERROR",
    ...(err.details && { details: err.details }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

export function createAppError(message: string, statusCode: number, code: string, details?: Record<string, string[]>): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}
