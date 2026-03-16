const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

function getDatabasePath() {
  return path.resolve(__dirname, "../data/database.sqlite");
}

function getSchemaPath() {
  return path.resolve(__dirname, "./init-db.sql");
}

function loadSchema(schemaPath) {
  return fs.readFileSync(schemaPath, "utf-8");
}

function initializeDatabase() {
  const dbPath = getDatabasePath();
  const schemaPath = getSchemaPath();

  const db = new Database(dbPath);

  try {
    // Keep foreign key checks active for all schema/data operations.
    db.pragma("foreign_keys = ON");

    const schemaSql = loadSchema(schemaPath);
    db.exec(schemaSql);

    console.log("Database initialized successfully.");
    console.log(`Database file: ${dbPath}`);
  } finally {
    db.close();
  }
}

initializeDatabase();
