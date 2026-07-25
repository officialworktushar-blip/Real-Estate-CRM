import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase";
import { createAppError } from "./errorHandler";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  organizationId?: string;
}

export async function auth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return next(createAppError("No token provided", 401, "UNAUTHORIZED"));
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      return next(createAppError("Invalid token", 401, "UNAUTHORIZED"));
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", data.user.id)
      .single();

    req.userId = data.user.id;
    req.userRole = profile?.role || "user";
    req.organizationId = profile?.organization_id;

    next();
  } catch (err) {
    next(createAppError("Authentication failed", 401, "UNAUTHORIZED"));
  }
}
