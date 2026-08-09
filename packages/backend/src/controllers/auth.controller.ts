import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { createAppError } from "../middleware/errorHandler";
import { getUserId } from "../utils/helpers";

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json({ data: result, message: "Login successful" });
    } catch (err) {
      next(err);
    }
  },

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ data: result, message: "Registration successful" });
    } catch (err) {
      next(err);
    }
  },

  async ensureOrg(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      if (!userId) throw createAppError("Unauthorized", 401, "UNAUTHORIZED");
      const result = await authService.ensureOrg(userId, req.body?.full_name);
      res.json({ data: result, message: "Organization ready" });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body.email);
      res.json({ message: "Password reset email sent" });
    } catch (err) {
      next(err);
    }
  },

  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ message: "Logged out successfully" });
    } catch (err) {
      next(err);
    }
  },
};
