import rateLimit from "express-rate-limit";
import type { Request } from "express";
import { config } from "../config";

const RATE_LIMIT_MESSAGE = {
  message: "Too many requests, please try again later",
  code: "RATE_LIMITED",
};

const isAdminRoute = (req: Request) => req.path.startsWith("/api/admin");

// Generic limiter for everything except admin routes in development.
// Admin dashboard widgets fire several requests per page load, so admin is
// allowed to bypass this limit during development.
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  skip: (req: Request) => isAdminRoute(req) && config.nodeEnv === "development",
  message: RATE_LIMIT_MESSAGE,
  standardHeaders: true,
  legacyHeaders: false,
});

// Looser limiter for /api/admin/* so the admin panel is never blocked by 429.
export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.nodeEnv === "development" ? 10000 : 1000,
  message: RATE_LIMIT_MESSAGE,
  standardHeaders: true,
  legacyHeaders: false,
});
