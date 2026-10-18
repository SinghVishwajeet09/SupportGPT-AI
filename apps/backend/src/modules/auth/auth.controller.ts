import type { RequestHandler } from "express";
import { loadEnvironment } from "../../config/env.js";
import { AppError } from "../../utils/app-error.js";
import { sendSuccess } from "../../utils/response.js";
import { AuthService } from "./auth.service.js";

const service = new AuthService();
const cookieOptions = () => {
  const env = loadEnvironment();
  return { httpOnly: true, secure: env.NODE_ENV === "production", sameSite: "lax" as const, path: "/api/auth", maxAge: 7 * 24 * 60 * 60 * 1000 };
};
const refreshFromRequest = (request: Parameters<RequestHandler>[0]) => request.cookies?.refreshToken ?? request.body?.refreshToken;
const respondWithSession: RequestHandler = async (request, response, next) => {
  try {
    const session = request.path.endsWith("register")
      ? await service.register(request.body)
      : await service.login(request.body);
    response.cookie("refreshToken", session.refreshToken, { ...cookieOptions(), maxAge: session.refreshTtlMs });
    return sendSuccess(response, { user: session.user, accessToken: session.accessToken }, "Authentication successful.", 201);
  } catch (error) { next(error); }
};

export const register = respondWithSession;
export const login = respondWithSession;
export const refresh: RequestHandler = async (request, response, next) => {
  try {
    const token = refreshFromRequest(request);
    if (!token) throw new AppError(401, "INVALID_REFRESH_TOKEN", "Your session has expired. Please sign in again.");
    const session = await service.refresh(token);
    response.cookie("refreshToken", session.refreshToken, { ...cookieOptions(), maxAge: session.refreshTtlMs });
    return sendSuccess(response, { user: session.user, accessToken: session.accessToken }, "Session refreshed.");
  } catch (error) { next(error); }
};
export const logout: RequestHandler = async (request, response, next) => {
  try {
    await service.logout(refreshFromRequest(request));
    response.clearCookie("refreshToken", cookieOptions());
    return sendSuccess(response, null, "Logged out successfully.");
  } catch (error) { next(error); }
};
export const me: RequestHandler = async (request, response, next) => {
  try { return sendSuccess(response, await service.getPublicUser(request.auth!.userId)); } catch (error) { next(error); }
};
