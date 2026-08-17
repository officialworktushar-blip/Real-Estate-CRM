import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase";
import { createAppError } from "./errorHandler";
import { logger } from "../utils/logger";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  organizationId?: string;
}

/**
 * Auto-provision an organization for a non-super-admin user whose profile
 * lacks an org_id.  This is the "belt" that ensures every normal user always
 * has a linked org before any controller runs — so controllers never have to
 * deal with the NO_ORGANIZATION case for regular users.
 *
 * Super admins are intentionally allowed to have no org (they access the
 * Admin Panel which operates across all orgs).
 */
async function autoProvisionOrgIfNeeded(
  userId: string,
  userRole: string,
  fullName?: string,
  email?: string
): Promise<string | undefined> {
  if (userRole === "super_admin") return undefined;

  // Lazily import to avoid circular dependencies at module-load time.
  const { authService } = await import("../services/auth.service");

  try {
    const result = await authService.ensureOrg(userId, fullName);
    logger.info(
      `[auth] Auto-provisioned org ${result.org_id} for user ${userId}`
    );
    return result.org_id;
  } catch (err) {
    logger.error(
      `[auth] Auto-provision org FAILED for user ${userId}:`,
      err
    );
    return undefined;
  }
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

    // If a non-admin user has no linked org, provision one automatically.
    if (!req.organizationId && req.userRole !== "super_admin") {
      const provisionedOrgId = await autoProvisionOrgIfNeeded(
        req.userId!,
        req.userRole || "user",
        data.user.user_metadata?.full_name,
        data.user.email
      );
      if (provisionedOrgId) {
        req.organizationId = provisionedOrgId;
      }
    }

    logger.debug(
      `[auth] User ${req.userId} verified with role "${req.userRole}" (org ${req.organizationId || "none"})`
    );

    next();
  } catch (err) {
    logger.error("[auth] Authentication failed with unexpected error:", err);
    next(createAppError("Authentication failed", 401, "UNAUTHORIZED"));
  }
}
