import { Request } from "express";
import { AuthRequest } from "../middleware/auth";

export function getUserId(req: Request): string {
  return (req as AuthRequest).userId || "";
}

export function getUserRole(req: Request): string {
  return (req as AuthRequest).userRole || "user";
}

export function getOrganizationId(req: Request): string {
  return (req as AuthRequest).organizationId || "";
}
