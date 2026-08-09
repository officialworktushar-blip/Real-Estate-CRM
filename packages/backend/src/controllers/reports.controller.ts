import { Request, Response, NextFunction } from "express";
import { reportsService } from "../services/reports.service";
import { getOrgScope } from "../utils/helpers";

export const reportsController = {
  async pipeline(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrgScope(req);
      const data = await reportsService.pipeline(orgId);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },

  async performance(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrgScope(req);
      const { start, end } = req.query;
      const data = await reportsService.performance(orgId, { start: start as string, end: end as string });
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },

  async revenue(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrgScope(req);
      const { start, end } = req.query;
      const data = await reportsService.revenue(orgId, { start: start as string, end: end as string });
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
};
