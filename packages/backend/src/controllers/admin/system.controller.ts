import { Request, Response, NextFunction } from "express";
import { adminSystemService } from "../../services/admin/system.service";

export const adminSystemController = {
  async health(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminSystemService.health();
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },

  async stats(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminSystemService.stats();
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },

  async auditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = "1", limit = "50" } = req.query;
      const result = await adminSystemService.auditLogs({ page: Number(page), limit: Number(limit) });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
