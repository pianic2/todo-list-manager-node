const fs = require("fs");
const path = require("path");
const request = require("supertest");

describe("rate limiting", () => {
  const originalEnv = { ...process.env };
  const testDbDir = path.resolve(__dirname, ".tmp");
  const testDbPath = path.join(testDbDir, "rate-limit.sqlite");

  afterEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  test("returns a stable 429 contract after the configured limit", async () => {
    fs.mkdirSync(testDbDir, { recursive: true });

    process.env = {
      ...originalEnv,
      NODE_ENV: "test",
      DATABASE_PATH: testDbPath,
      RATE_LIMIT_WINDOW_MS: "60000",
      RATE_LIMIT_MAX: "1",
    };

    jest.resetModules();
    const app = require("../src/server");
    const db = require("../src/db/database");

    try {
      const firstResponse = await request(app).get("/");
      const secondResponse = await request(app).get("/");

      expect(firstResponse.status).toBe(200);
      expect(secondResponse.status).toBe(429);
      expect(secondResponse.body).toEqual({
        success: false,
        error: "too many requests",
      });
      expect(secondResponse.headers["retry-after"]).toBe("60");
    } finally {
      db.close();
    }
  });
});
