const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const { readRuntimeConfig } = require("../config/runtime.config");

function validateDatabasePath(dbPath) {
  const parentDir = path.dirname(dbPath);

  if (!fs.existsSync(parentDir)) {
    throw new Error(`Invalid DATABASE_PATH "${dbPath}": parent directory does not exist.`);
  }

  if (fs.existsSync(dbPath) && fs.statSync(dbPath).isDirectory()) {
    throw new Error(`Invalid DATABASE_PATH "${dbPath}": expected a file, got a directory.`);
  }
}

const { databasePath } = readRuntimeConfig();

validateDatabasePath(databasePath);

// Open the database in a single shared instance for the whole app.
const db = new Database(databasePath);

// Enforce relational integrity for foreign keys.
db.pragma("foreign_keys = ON");

module.exports = db;
