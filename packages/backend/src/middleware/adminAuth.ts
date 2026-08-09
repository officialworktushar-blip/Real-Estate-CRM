import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { createAppError } from "./errorHandler";
import { logger } from "../utils/logger";

export function adminAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  if (req.userRole !== "super_admin") {
    logger.warn(
      `[adminAuth] Access denied for user ${req.userId || "unknown"} (role: ${
        req.userRole || "unknown"
      })`
    );
    return next(createAppError("Admin access required", 403, "FORBIDDEN"));
  }
  next();
}
