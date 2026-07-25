import { Request, Response, NextFunction } from "express";
import { propertiesService } from "../services/properties.service";
import { getOrganizationId } from "../utils/helpers";

export const propertiesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrganizationId(req);
      const { page = "1", limit = "20", search } = req.query;
      const result = await propertiesService.list(orgId, {
        page: Number(page),
        limit: Number(limit),
        search: search as string,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrganizationId(req);
      const property = await propertiesService.getById(req.params.id, orgId);
      res.json({ data: property });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrganizationId(req);
      const property = await propertiesService.create(req.body, orgId);
      res.status(201).json({ data: property, message: "Property created" });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrganizationId(req);
      const property = await propertiesService.update(req.params.id, req.body, orgId);
      res.json({ data: property, message: "Property updated" });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrganizationId(req);
      await propertiesService.remove(req.params.id, orgId);
      res.json({ message: "Property deleted" });
    } catch (err) {
      next(err);
    }
  },
};
