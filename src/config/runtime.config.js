const path = require("path");

const allowedNodeEnvs = new Set(["development", "test", "production"]);

function readRuntimeConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || "development";
  const databasePath = env.DATABASE_PATH;

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
  };
}

module.exports = {
  readRuntimeConfig,
};
