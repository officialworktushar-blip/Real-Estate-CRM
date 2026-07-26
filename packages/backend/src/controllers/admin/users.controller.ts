import { Request, Response, NextFunction } from "express";
import { adminUsersService } from "../../services/admin/users.service";

export const adminUsersController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = "1", limit = "20", search } = req.query;
      const result = await adminUsersService.list({ page: Number(page), limit: Number(limit), search: search as string });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await adminUsersService.getById(String(req.params.id));
      res.json({ data: user });
    } catch (err) {
      next(err);
    }
  },

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await adminUsersService.updateRole(String(req.params.id), req.body.role);
      res.json({ data: user, message: "Role updated" });
    } catch (err) {
      next(err);
    }
  },

  async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      await adminUsersService.deactivate(String(req.params.id));
      res.json({ message: "User deactivated" });
    } catch (err) {
      next(err);
    }
  },
};
