import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "./app.js";

const env = {
  NODE_ENV: "test",
  API_PORT: "4000",
  DATABASE_URL: "postgresql://user:password@localhost:5432/supportgpt",
  FRONTEND_URL: "http://localhost:5173",
  JWT_SECRET: "a_very_long_test_secret_that_has_at_least_32_chars",
  JWT_REFRESH_SECRET: "another_very_long_test_secret_that_has_at_least_32_chars",
  JWT_ACCESS_TTL: "15m",
  JWT_REFRESH_TTL: "7d"
};
beforeEach(() => { Object.assign(process.env, env); });

describe("API foundation", () => {
  it("returns the liveness response using the standard envelope", async () => {
    const response = await request(createApp()).get("/api/health/live");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, data: { status: "ok" } });
  });

  it("normalizes unknown routes", async () => {
    const response = await request(createApp()).get("/api/missing");
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  it("validates registration input before database access", async () => {
    const response = await request(createApp()).post("/api/auth/register").send({ name: "A", email: "not-email", password: "short" });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
