import crypto from "node:crypto";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { loadEnvironment } from "./config/env.js";
import { logger } from "./config/logger.js";
import { errorHandler, notFound } from "./middleware/error-handler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { ticketRouter } from "./modules/tickets/ticket.routes.js";
import { sendSuccess } from "./utils/response.js";

export function createApp() {
  const env = loadEnvironment();
  const app = express();
  app.disable("x-powered-by");
  app.use((request, response, next) => { request.id = request.header("x-request-id") ?? crypto.randomUUID(); response.setHeader("x-request-id", request.id); next(); });
  app.use(pinoHttp({ logger, genReqId: (request) => request.id }));
  app.use(helmet());
  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: "draft-8", legacyHeaders: false }));
  app.get("/api/health/live", (_request, response) => sendSuccess(response, { status: "ok" }));
  app.use("/api/auth", authRouter);
  app.use("/api/tickets", ticketRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
