import { Request, Response, NextFunction } from "express";
import { dealsService } from "../services/deals.service";
import { getOrgScope, getWriteOrg } from "../utils/helpers";

export const dealsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrgScope(req);
      const { page = "1", limit = "20", search, stage } = req.query;
      const result = await dealsService.list(orgId, { page: Number(page), limit: Number(limit), search: search as string, stage: stage as string });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrgScope(req);
      const deal = await dealsService.getById(String(req.params.id), orgId);
      res.json({ data: deal });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getWriteOrg(req);
      const deal = await dealsService.create(req.body, orgId);
      res.status(201).json({ data: deal, message: "Deal created" });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrgScope(req);
      const deal = await dealsService.update(String(req.params.id), req.body, orgId);
      res.json({ data: deal, message: "Deal updated" });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrgScope(req);
      await dealsService.remove(String(req.params.id), orgId);
      res.json({ message: "Deal deleted" });
    } catch (err) {
      next(err);
    }
  },
};
