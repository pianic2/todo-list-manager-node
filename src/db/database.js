const path = require("path");
const Database = require("better-sqlite3");

// Store the SQLite file in the project-level data folder.
const dbPath = path.resolve(__dirname, "../../data/database.sqlite");

// Open the database in a single shared instance for the whole app.
const db = new Database(dbPath);

// Enforce relational integrity for foreign keys.
db.pragma("foreign_keys = ON");

module.exports = db;
