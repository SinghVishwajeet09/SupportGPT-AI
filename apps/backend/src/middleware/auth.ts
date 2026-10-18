import type { RequestHandler } from "express";
import type { Role } from "@prisma/client";
import jwt from "jsonwebtoken";
import { loadEnvironment } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

type AccessPayload = { sub: string; role: Role; type: "access" };

export const authenticate: RequestHandler = (request, _response, next) => {
  const authorization = request.header("authorization");
  if (!authorization?.startsWith("Bearer ")) return next(new AppError(401, "UNAUTHENTICATED", "Authentication is required."));
  try {
    const payload = jwt.verify(authorization.slice(7), loadEnvironment().JWT_SECRET) as AccessPayload;
    if (payload.type !== "access" || !payload.sub || !payload.role) throw new Error("Invalid access token payload");
    request.auth = { userId: payload.sub, role: payload.role };
    next();
  } catch {
    next(new AppError(401, "INVALID_TOKEN", "Your session is invalid or has expired."));
  }
};

export const authorize = (...roles: Role[]): RequestHandler => (request, _response, next) => {
  if (!request.auth) return next(new AppError(401, "UNAUTHENTICATED", "Authentication is required."));
  if (!roles.includes(request.auth.role)) return next(new AppError(403, "FORBIDDEN", "You do not have permission to perform this action."));
  next();
};
