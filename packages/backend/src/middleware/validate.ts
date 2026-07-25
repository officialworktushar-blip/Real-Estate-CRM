import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { createAppError } from "./errorHandler";

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details: Record<string, string[]> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join(".");
        if (!details[path]) details[path] = [];
        details[path].push(err.message);
      });
      return next(createAppError("Validation failed", 422, "VALIDATION_ERROR", details));
    }
    req.body = result.data;
    next();
  };
}
