import { Request, Response, NextFunction } from "express";
import { adminSubscriptionsService } from "../../services/admin/subscriptions.service";

export const adminSubscriptionsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = "1", limit = "20" } = req.query;
      const result = await adminSubscriptionsService.list({ page: Number(page), limit: Number(limit) });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const sub = await adminSubscriptionsService.update(String(req.params.id), req.body);
      res.json({ data: sub, message: "Subscription updated" });
    } catch (err) {
      next(err);
    }
  },

  async stats(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminSubscriptionsService.stats();
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
};
