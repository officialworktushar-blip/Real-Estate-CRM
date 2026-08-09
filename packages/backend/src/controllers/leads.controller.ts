import { Request, Response, NextFunction } from "express";
import { leadsService } from "../services/leads.service";
import { getOrgScope, getWriteOrg } from "../utils/helpers";

export const leadsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrgScope(req);
      const { page = "1", limit = "20", search, sort_by, sort_order } = req.query;
      const result = await leadsService.list(orgId, {
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        sortBy: sort_by as string,
        sortOrder: sort_order as "asc" | "desc",
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrgScope(req);
      const lead = await leadsService.getById(String(req.params.id), orgId);
      res.json({ data: lead });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getWriteOrg(req);
      const lead = await leadsService.create(req.body, orgId);
      res.status(201).json({ data: lead, message: "Lead created" });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrgScope(req);
      const lead = await leadsService.update(String(req.params.id), req.body, orgId);
      res.json({ data: lead, message: "Lead updated" });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrgScope(req);
      await leadsService.remove(String(req.params.id), orgId);
      res.json({ message: "Lead deleted" });
    } catch (err) {
      next(err);
    }
  },
};
