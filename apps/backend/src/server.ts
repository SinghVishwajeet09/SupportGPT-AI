import { createApp } from "./app.js";
import { loadEnvironment } from "./config/env.js";
import { logger } from "./config/logger.js";
import { prisma } from "./lib/prisma.js";

const env = loadEnvironment();
const app = createApp();
const server = app.listen(env.API_PORT, () => logger.info({ port: env.API_PORT }, "SupportGPT API listening"));

const shutdown = async (signal: string) => {
  logger.info({ signal }, "Shutting down");
  server.close(async () => { await prisma.$disconnect(); process.exit(0); });
};
process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
