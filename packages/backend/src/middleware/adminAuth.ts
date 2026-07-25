import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { createAppError } from "./errorHandler";

export function adminAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  if (req.userRole !== "super_admin") {
    return next(createAppError("Admin access required", 403, "FORBIDDEN"));
  }
  next();
}
