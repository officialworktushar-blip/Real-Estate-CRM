import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { createAppError } from "./errorHandler";

export function adminAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  if (req.userRole !== "super_admin") {
    console.warn(
      `[adminAuth] Access denied for user ${req.userId || "unknown"} (role: ${
        req.userRole || "unknown"
      })`
    );
    return next(createAppError("Admin access required", 403, "FORBIDDEN"));
  }
  console.log(
    `[adminAuth] Access granted for user ${req.userId || "unknown"} (role: ${req.userRole})`
  );
  next();
}
