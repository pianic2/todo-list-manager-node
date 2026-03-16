const request = require("supertest");
const app = require("../src/server");
const db = require("../src/db/database");

beforeEach(() => {
  db.prepare("DELETE FROM items").run();
  db.prepare("DELETE FROM lists").run();
});

module.exports = {
  app,
  db,
  request,
};
