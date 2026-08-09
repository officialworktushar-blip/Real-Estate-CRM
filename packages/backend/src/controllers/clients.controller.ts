import { Request, Response, NextFunction } from "express";
import { clientsService } from "../services/clients.service";
import { getOrgScope, getWriteOrg } from "../utils/helpers";

export const clientsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrgScope(req);
      const { page = "1", limit = "20", search } = req.query;
      const result = await clientsService.list(orgId, { page: Number(page), limit: Number(limit), search: search as string });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrgScope(req);
      const client = await clientsService.getById(String(req.params.id), orgId);
      res.json({ data: client });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getWriteOrg(req);
      const client = await clientsService.create(req.body, orgId);
      res.status(201).json({ data: client, message: "Client created" });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrgScope(req);
      const client = await clientsService.update(String(req.params.id), req.body, orgId);
      res.json({ data: client, message: "Client updated" });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrgScope(req);
      await clientsService.remove(String(req.params.id), orgId);
      res.json({ message: "Client deleted" });
    } catch (err) {
      next(err);
    }
  },
};
