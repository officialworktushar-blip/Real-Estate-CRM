import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase";
import { createAppError } from "./errorHandler";
import { logger } from "../utils/logger";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  organizationId?: string;
}

export async function auth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^Bearer\s+/i, "");

    if (!authHeader || !token) {
      logger.warn(
        `[auth] No Authorization header for ${req.method} ${req.originalUrl}`
      );
      return next(createAppError("No token provided", 401, "UNAUTHORIZED"));
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      logger.warn(
        `[auth] Token verification FAILED for ${req.method} ${req.originalUrl}: ${
          error?.message || "No user returned"
        }`
      );
      return next(createAppError("Invalid token", 401, "UNAUTHORIZED"));
    }

    logger.debug(`[auth] Token verified for user: ${data.user.id}`);

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    req.userId = data.user.id;
    req.userRole = profile?.role || "user";
    req.organizationId = profile?.org_id;

    logger.debug(
      `[auth] User ${req.userId} verified with role "${req.userRole}" (org ${req.organizationId || "none"})`
    );

    next();
  } catch (err) {
    logger.error("[auth] Authentication failed with unexpected error:", err);
    next(createAppError("Authentication failed", 401, "UNAUTHORIZED"));
  }
}
