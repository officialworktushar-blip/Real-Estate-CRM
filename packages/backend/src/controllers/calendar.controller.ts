import { Request, Response, NextFunction } from "express";
import { calendarService } from "../services/calendar.service";
import { getOrganizationId, getUserId } from "../utils/helpers";

export const calendarController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrganizationId(req);
      const userId = getUserId(req);
      const { start, end } = req.query;
      const result = await calendarService.list(orgId, userId, { start: start as string, end: end as string });
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrganizationId(req);
      const event = await calendarService.getById(req.params.id, orgId);
      res.json({ data: event });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrganizationId(req);
      const userId = getUserId(req);
      const event = await calendarService.create({ ...req.body, user_id: userId }, orgId);
      res.status(201).json({ data: event, message: "Event created" });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrganizationId(req);
      const event = await calendarService.update(req.params.id, req.body, orgId);
      res.json({ data: event, message: "Event updated" });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = getOrganizationId(req);
      await calendarService.remove(req.params.id, orgId);
      res.json({ message: "Event deleted" });
    } catch (err) {
      next(err);
    }
  },
};
