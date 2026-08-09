import { Request } from "express";
import { AuthRequest } from "../middleware/auth";
import { createAppError } from "../middleware/errorHandler";

export function getUserId(req: Request): string {
  return (req as AuthRequest).userId || "";
}

export function getUserRole(req: Request): string {
  return (req as AuthRequest).userRole || "user";
}

export function getOrganizationId(req: Request): string {
  return (req as AuthRequest).organizationId || "";
}

/**
 * The org used for READ scoping (list/getById):
 * - super_admin: sees all data unless an explicit `org_id` query param is given.
 * - everyone else: always scoped to their own profile org_id (client params ignored).
 */
export function getOrgScope(req: Request): string | null {
  const authReq = req as AuthRequest;
  if (authReq.userRole === "super_admin") {
    const requested = req.query.org_id;
    return typeof requested === "string" && requested.length > 0 ? requested : null;
  }
  // Non-super-admins are always scoped to their own org. A user without a
  // linked org must NOT fall back to an unfiltered (all-orgs) query.
  if (!authReq.organizationId) {
    throw createAppError("No organization linked to this account", 403, "NO_ORGANIZATION");
  }
  return authReq.organizationId;
}

/**
 * The org used for WRITE scoping (create): always the requester's own org_id.
 * Returns null when the user has no linked org (callers should 400).
 */
export function getWriteOrg(req: Request): string | null {
  return (req as AuthRequest).organizationId || null;
}
