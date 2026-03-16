const path = require("path");
const Database = require("better-sqlite3");

// Store the SQLite file in the project-level data folder.
const dbPath = path.resolve(__dirname, "../../data/todo.db");

// Create/open the SQLite database connection.
const db = new Database(dbPath);

module.exports = db;
