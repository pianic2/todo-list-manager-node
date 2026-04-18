const { readRuntimeConfig } = require("../src/config/runtime.config");

describe("runtime configuration", () => {
  test("resolves distinct database paths for supported environments", () => {
    const development = readRuntimeConfig({
      NODE_ENV: "development",
      DATABASE_PATH: "./data/development.sqlite",
    });
    const test = readRuntimeConfig({
      NODE_ENV: "test",
      DATABASE_PATH: "./tests/.tmp/test.sqlite",
    });
    const production = readRuntimeConfig({
      NODE_ENV: "production",
      DATABASE_PATH: "/tmp/todo-list-manager-production.sqlite",
    });

    expect(development.nodeEnv).toBe("development");
    expect(test.nodeEnv).toBe("test");
    expect(production.nodeEnv).toBe("production");
    expect(new Set([development.databasePath, test.databasePath, production.databasePath]).size).toBe(3);
  });

  test("rejects invalid runtime configuration clearly", () => {
    expect(() => readRuntimeConfig({ NODE_ENV: "staging", DATABASE_PATH: "./data/app.sqlite" })).toThrow(
      /Invalid NODE_ENV/
    );
    expect(() => readRuntimeConfig({ NODE_ENV: "production" })).toThrow(/DATABASE_PATH is required/);
  });
});
