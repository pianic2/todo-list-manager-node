const fs = require("fs");
const path = require("path");
const request = require("supertest");

const testDbDir = path.resolve(__dirname, ".tmp");
const testDbPath = path.join(testDbDir, `database-${process.env.JEST_WORKER_ID || "local"}.sqlite`);

fs.mkdirSync(testDbDir, { recursive: true });
process.env.DATABASE_PATH = testDbPath;

const app = require("../src/server");
const db = require("../src/db/database");

const schema = fs.readFileSync(path.resolve(__dirname, "../scripts/init-db.sql"), "utf-8");

beforeAll(() => {
  db.exec(`
    DROP TABLE IF EXISTS items;
    DROP TABLE IF EXISTS lists;
  `);
  db.exec(schema);
});

beforeEach(() => {
  db.prepare("DELETE FROM items").run();
  db.prepare("DELETE FROM lists").run();
});

afterAll(() => {
  db.close();
});

module.exports = {
  app,
  db,
  request,
};
