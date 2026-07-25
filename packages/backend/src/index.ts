import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { config } from "./config";
import { logger } from "./utils/logger";

const server = app.listen(config.port, () => {
  logger.info(`Oryntal Estate API running on port ${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});

process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err: Error) => {
  logger.error("Uncaught Exception:", err.message);
  server.close(() => process.exit(1));
});
