import type { Role, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { loadEnvironment } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";

const publicUser = (user: User) => ({ id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl, isVerified: user.isVerified, createdAt: user.createdAt });
const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

function signAccessToken(userId: string, role: Role): string {
  const env = loadEnvironment();
  return jwt.sign({ sub: userId, role, type: "access" }, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions["expiresIn"] });
}
function signRefreshToken(userId: string, role: Role): string {
  const env = loadEnvironment();
  return jwt.sign({ sub: userId, role, type: "refresh" }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_TTL as jwt.SignOptions["expiresIn"] });
}

export class AuthService {
  async register(input: { name: string; email: string; password: string }) {
    const exists = await prisma.user.findUnique({ where: { email: input.email } });
    if (exists) throw new AppError(409, "EMAIL_IN_USE", "An account with this email already exists.");
    const user = await prisma.user.create({ data: { name: input.name, email: input.email, passwordHash: await bcrypt.hash(input.password, 12) } });
    return this.createSession(user);
  }

  async login(input: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
    return this.createSession(user);
  }

  async refresh(rawToken: string) {
    const env = loadEnvironment();
    try {
      const payload = jwt.verify(rawToken, env.JWT_REFRESH_SECRET) as { sub: string; role: Role; type: string; exp: number };
      if (payload.type !== "refresh") throw new Error("Invalid refresh type");
      const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(rawToken) }, include: { user: true } });
      if (!stored || stored.revokedAt || stored.expiresAt <= new Date()) throw new AppError(401, "INVALID_REFRESH_TOKEN", "Your session has expired. Please sign in again.");
      await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
      return this.createSession(stored.user);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(401, "INVALID_REFRESH_TOKEN", "Your session has expired. Please sign in again.");
    }
  }

  async logout(rawToken?: string) {
    if (rawToken) await prisma.refreshToken.updateMany({ where: { tokenHash: hashToken(rawToken), revokedAt: null }, data: { revokedAt: new Date() } });
  }

  async getPublicUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, "USER_NOT_FOUND", "User account was not found.");
    return publicUser(user);
  }

  private async createSession(user: User) {
    const env = loadEnvironment();
    const refreshToken = signRefreshToken(user.id, user.role);
    const decoded = jwt.decode(refreshToken) as { exp?: number } | null;
    await prisma.refreshToken.create({ data: { userId: user.id, tokenHash: hashToken(refreshToken), expiresAt: new Date((decoded?.exp ?? 0) * 1000) } });
    return { user: publicUser(user), accessToken: signAccessToken(user.id, user.role), refreshToken, refreshTtlMs: parseJwtDuration(env.JWT_REFRESH_TTL) };
  }
}

function parseJwtDuration(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const amount = Number(match[1]);
  return amount * ({ s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2] as "s" | "m" | "h" | "d"]);
}
