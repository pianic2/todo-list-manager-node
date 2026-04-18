const path = require("path");

const allowedNodeEnvs = new Set(["development", "test", "production"]);
const defaultCorsOrigins = {
  development: ["http://localhost:3100", "http://127.0.0.1:3100"],
  test: ["*"],
};

function parseCorsOrigins(value) {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function readCorsOrigins(env, nodeEnv, requireCorsOrigin) {
  const configuredOrigins = env.CORS_ORIGIN || env.CORS_ORIGINS;

  if (typeof configuredOrigins === "string" && configuredOrigins.trim() !== "") {
    return parseCorsOrigins(configuredOrigins);
  }

  if (nodeEnv === "production" && requireCorsOrigin) {
    throw new Error("CORS_ORIGIN is required in production.");
  }

  return defaultCorsOrigins[nodeEnv] || [];
}

function readPositiveInteger(value, fallback, name) {
  if (value === undefined) {
    return fallback;
  }

  if (!/^[1-9]\d*$/.test(String(value))) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return Number(value);
}

function readRuntimeConfig(env = process.env, options = {}) {
  const nodeEnv = env.NODE_ENV || "development";
  const databasePath = env.DATABASE_PATH;
  const requireCorsOrigin = options.requireCorsOrigin === true;

  if (!allowedNodeEnvs.has(nodeEnv)) {
    throw new Error(
      `Invalid NODE_ENV "${nodeEnv}". Expected one of: development, test, production.`
    );
  }

  if (typeof databasePath !== "string" || databasePath.trim() === "") {
    throw new Error("DATABASE_PATH is required and must point to a SQLite database file.");
  }

  return {
    nodeEnv,
    databasePath: path.resolve(databasePath),
    corsOrigins: readCorsOrigins(env, nodeEnv, requireCorsOrigin),
    rateLimit: {
      windowMs: readPositiveInteger(env.RATE_LIMIT_WINDOW_MS, 60_000, "RATE_LIMIT_WINDOW_MS"),
      maxRequests: readPositiveInteger(env.RATE_LIMIT_MAX, 100, "RATE_LIMIT_MAX"),
    },
  };
}

module.exports = {
  readRuntimeConfig,
};
