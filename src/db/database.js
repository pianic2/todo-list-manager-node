const path = require("path");
const Database = require("better-sqlite3");

const dbPath = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.resolve(__dirname, "../../data/database.sqlite");

// Open the database in a single shared instance for the whole app.
const db = new Database(dbPath);

// Enforce relational integrity for foreign keys.
db.pragma("foreign_keys = ON");

module.exports = db;
