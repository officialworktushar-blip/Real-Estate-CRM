import { Request, Response, NextFunction } from "express";
import { adminBillingService } from "../../services/admin/billing.service";

export const adminBillingController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = "1", limit = "20" } = req.query;
      const result = await adminBillingService.list({ page: Number(page), limit: Number(limit) });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async revenue(req: Request, res: Response, next: NextFunction) {
    try {
      const { start, end } = req.query;
      const data = await adminBillingService.revenue({ start: start as string, end: end as string });
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
};
