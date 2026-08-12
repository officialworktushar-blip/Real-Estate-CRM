import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { rateLimiter, adminRateLimiter } from "./middleware/rateLimiter";
import routes from "./routes";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(morgan("dev"));
app.use(rateLimiter);
app.use("/api/admin", adminRateLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));
app.use("/api/webhooks/razorpay", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));

app.use("/api", routes);

app.use(errorHandler);

export default app;
